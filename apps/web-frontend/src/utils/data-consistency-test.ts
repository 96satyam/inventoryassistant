/**
 * Data Consistency Test Utility
 * Tests and validates data consistency across local and public URL deployments
 * Helps identify and resolve data format mismatches
 */

import { 
  normalizeInventoryData, 
  normalizeForecastData, 
  normalizeStatsData, 
  normalizeProcurementLogs,
  validateDataConsistency,
  logDataSource
} from './data-normalizer';

import { detectEnvironment, testApiConnectivity } from './environment-config';

export interface DataConsistencyReport {
  environment: string;
  timestamp: string;
  apiConnectivity: {
    primary: boolean;
    fallback: boolean;
    error?: string;
  };
  endpoints: {
    [endpoint: string]: {
      accessible: boolean;
      dataValid: boolean;
      dataFormat: string;
      itemCount: number;
      sampleData?: any;
      normalizedData?: any;
      errors: string[];
    };
  };
  summary: {
    totalEndpoints: number;
    accessibleEndpoints: number;
    validDataEndpoints: number;
    issues: string[];
  };
}

/**
 * Test all API endpoints for data consistency
 */
export async function runDataConsistencyTest(): Promise<DataConsistencyReport> {
  console.group('🧪 Running Data Consistency Test');
  
  const env = detectEnvironment();
  const report: DataConsistencyReport = {
    environment: `${env.type} (${env.hostname})`,
    timestamp: new Date().toISOString(),
    apiConnectivity: await testApiConnectivity(),
    endpoints: {},
    summary: {
      totalEndpoints: 0,
      accessibleEndpoints: 0,
      validDataEndpoints: 0,
      issues: []
    }
  };

  // Define endpoints to test
  const endpointsToTest = [
    { path: '/stats/', type: 'stats', normalizer: normalizeStatsData },
    { path: '/inventory/', type: 'inventory', normalizer: normalizeInventoryData },
    { path: '/forecast/', type: 'forecast', normalizer: normalizeForecastData },
    { path: '/procurement/logs', type: 'logs', normalizer: normalizeProcurementLogs }
  ];

  report.summary.totalEndpoints = endpointsToTest.length;

  // Test each endpoint
  for (const endpoint of endpointsToTest) {
    console.log(`🔍 Testing endpoint: ${endpoint.path}`);
    
    const endpointReport = {
      accessible: false,
      dataValid: false,
      dataFormat: 'unknown',
      itemCount: 0,
      sampleData: undefined,
      normalizedData: undefined,
      errors: [] as string[]
    };

    try {
      // Try primary API first
      let response: Response | null = null;
      let data: any = null;

      try {
        response = await fetch(`${env.apiBaseUrl}${endpoint.path}`, {
          method: 'GET',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (response.ok) {
          data = await response.json();
          endpointReport.accessible = true;
          report.summary.accessibleEndpoints++;
          console.log(`✅ Primary API accessible: ${endpoint.path}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (primaryError) {
        console.log(`❌ Primary API failed: ${endpoint.path}`, primaryError);
        endpointReport.errors.push(`Primary API: ${primaryError}`);

        // Try fallback API if available
        if (env.fallbackApiUrl) {
          try {
            response = await fetch(`${env.fallbackApiUrl}${endpoint.path}`, {
              method: 'GET',
              signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
              data = await response.json();
              endpointReport.accessible = true;
              report.summary.accessibleEndpoints++;
              console.log(`✅ Fallback API accessible: ${endpoint.path}`);
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          } catch (fallbackError) {
            console.log(`❌ Fallback API failed: ${endpoint.path}`, fallbackError);
            endpointReport.errors.push(`Fallback API: ${fallbackError}`);
          }
        }
      }

      if (data) {
        // Analyze data format
        endpointReport.dataFormat = Array.isArray(data) ? 'array' : typeof data;
        endpointReport.itemCount = Array.isArray(data) ? data.length : Object.keys(data || {}).length;
        endpointReport.sampleData = Array.isArray(data) && data.length > 0 ? data[0] : data;

        // Log data source
        logDataSource(endpoint.path, data);

        // Validate data consistency
        const isValid = validateDataConsistency(data, endpoint.type as any);
        endpointReport.dataValid = isValid;

        if (isValid) {
          report.summary.validDataEndpoints++;
          console.log(`✅ Data valid: ${endpoint.path}`);

          // Test normalization
          try {
            const normalizedData = endpoint.normalizer(data);
            endpointReport.normalizedData = normalizedData;
            console.log(`✅ Data normalized: ${endpoint.path}`, normalizedData);
          } catch (normError) {
            endpointReport.errors.push(`Normalization failed: ${normError}`);
            console.error(`❌ Normalization failed: ${endpoint.path}`, normError);
          }
        } else {
          endpointReport.errors.push('Data validation failed');
          report.summary.issues.push(`${endpoint.path}: Invalid data format`);
          console.warn(`⚠️ Data invalid: ${endpoint.path}`);
        }
      } else {
        endpointReport.errors.push('No data received');
        report.summary.issues.push(`${endpoint.path}: No data received`);
      }

    } catch (error) {
      endpointReport.errors.push(`Unexpected error: ${error}`);
      report.summary.issues.push(`${endpoint.path}: ${error}`);
      console.error(`🔥 Unexpected error testing ${endpoint.path}:`, error);
    }

    report.endpoints[endpoint.path] = endpointReport;
  }

  // Generate summary
  if (report.summary.accessibleEndpoints === 0) {
    report.summary.issues.push('No API endpoints accessible');
  }

  if (report.summary.validDataEndpoints < report.summary.accessibleEndpoints) {
    report.summary.issues.push('Some endpoints return invalid data');
  }

  console.log('📊 Data Consistency Test Results:', report);
  console.groupEnd();

  return report;
}

/**
 * Generate human-readable report
 */
export function generateReadableReport(report: DataConsistencyReport): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(60));
  lines.push('DATA CONSISTENCY TEST REPORT');
  lines.push('='.repeat(60));
  lines.push(`Environment: ${report.environment}`);
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push('');
  
  // API Connectivity
  lines.push('API CONNECTIVITY:');
  lines.push(`  Primary API: ${report.apiConnectivity.primary ? '✅ OK' : '❌ Failed'}`);
  lines.push(`  Fallback API: ${report.apiConnectivity.fallback ? '✅ OK' : '❌ Failed'}`);
  if (report.apiConnectivity.error) {
    lines.push(`  Error: ${report.apiConnectivity.error}`);
  }
  lines.push('');
  
  // Endpoint Details
  lines.push('ENDPOINT ANALYSIS:');
  Object.entries(report.endpoints).forEach(([path, details]) => {
    lines.push(`  ${path}:`);
    lines.push(`    Accessible: ${details.accessible ? '✅' : '❌'}`);
    lines.push(`    Data Valid: ${details.dataValid ? '✅' : '❌'}`);
    lines.push(`    Data Format: ${details.dataFormat}`);
    lines.push(`    Item Count: ${details.itemCount}`);
    
    if (details.errors.length > 0) {
      lines.push(`    Errors:`);
      details.errors.forEach(error => {
        lines.push(`      - ${error}`);
      });
    }
    lines.push('');
  });
  
  // Summary
  lines.push('SUMMARY:');
  lines.push(`  Total Endpoints: ${report.summary.totalEndpoints}`);
  lines.push(`  Accessible: ${report.summary.accessibleEndpoints}`);
  lines.push(`  Valid Data: ${report.summary.validDataEndpoints}`);
  
  if (report.summary.issues.length > 0) {
    lines.push(`  Issues Found:`);
    report.summary.issues.forEach(issue => {
      lines.push(`    - ${issue}`);
    });
  } else {
    lines.push(`  ✅ No issues found!`);
  }
  
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

/**
 * Run test and display results in console
 */
export async function runAndDisplayTest(): Promise<void> {
  try {
    const report = await runDataConsistencyTest();
    const readableReport = generateReadableReport(report);
    
    console.log('\n' + readableReport);
    
    // Store report globally for debugging
    (window as any).__DATA_CONSISTENCY_REPORT = report;
    
  } catch (error) {
    console.error('🔥 Data consistency test failed:', error);
  }
}
