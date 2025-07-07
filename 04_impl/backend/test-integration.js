#!/usr/bin/env node

/**
 * [clarify] Vision Holder Integration Test
 * Tests frontend connectivity to all backend services
 */

const axios = require('axios');

// Service configurations
const services = [
    { name: 'Systemic Ledger API', port: 3001, baseUrl: 'http://localhost:3001' },
    { name: 'AI Orchestrator API', port: 3002, baseUrl: 'http://localhost:3002' },
    { name: 'Knowledge Base API', port: 3003, baseUrl: 'http://localhost:3003' },
    { name: 'Terminal API', port: 3004, baseUrl: 'http://localhost:3004' },
    { name: 'Analytics API', port: 3005, baseUrl: 'http://localhost:3005' }
];

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testServiceHealth(service) {
    try {
        log(`🔍 Testing ${service.name}...`, 'blue');
        
        // Test health endpoint
        const healthResponse = await axios.get(`${service.baseUrl}/health`, {
            timeout: 5000
        });
        
        if (healthResponse.status === 200) {
            log(`✅ ${service.name} is healthy`, 'green');
            log(`   Response: ${JSON.stringify(healthResponse.data)}`);
            return true;
        } else {
            log(`❌ ${service.name} returned status ${healthResponse.status}`, 'red');
            return false;
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            log(`❌ ${service.name} is not running (connection refused)`, 'red');
        } else if (error.code === 'ETIMEDOUT') {
            log(`❌ ${service.name} timed out`, 'red');
        } else {
            log(`❌ ${service.name} error: ${error.message}`, 'red');
        }
        return false;
    }
}

async function testServiceEndpoints(service) {
    const endpoints = [
        { path: '/health', method: 'GET', description: 'Health Check' },
        { path: '/', method: 'GET', description: 'Root Endpoint' }
    ];
    
    log(`🔍 Testing ${service.name} endpoints...`, 'blue');
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios({
                method: endpoint.method,
                url: `${service.baseUrl}${endpoint.path}`,
                timeout: 3000
            });
            
            log(`✅ ${endpoint.description}: ${response.status}`, 'green');
        } catch (error) {
            if (error.response) {
                log(`⚠️  ${endpoint.description}: ${error.response.status}`, 'yellow');
            } else {
                log(`❌ ${endpoint.description}: ${error.message}`, 'red');
            }
        }
    }
}

async function testFrontendConnectivity() {
    log('\n🌐 Testing Frontend Connectivity...', 'blue');
    
    try {
        const frontendResponse = await axios.get('http://localhost:3000', {
            timeout: 5000
        });
        
        if (frontendResponse.status === 200) {
            log('✅ Frontend is accessible on port 3000', 'green');
            return true;
        } else {
            log(`❌ Frontend returned status ${frontendResponse.status}`, 'red');
            return false;
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            log('❌ Frontend is not running on port 3000', 'red');
        } else {
            log(`❌ Frontend error: ${error.message}`, 'red');
        }
        return false;
    }
}

async function runIntegrationTests() {
    log('🚀 Vision Holder Integration Test', 'blue');
    log('=====================================\n');
    
    let healthyServices = 0;
    const totalServices = services.length;
    
    // Test each service
    for (const service of services) {
        const isHealthy = await testServiceHealth(service);
        if (isHealthy) {
            healthyServices++;
            await testServiceEndpoints(service);
        }
        log(''); // Empty line for readability
    }
    
    // Test frontend connectivity
    const frontendHealthy = await testFrontendConnectivity();
    
    // Summary
    log('=====================================', 'blue');
    log('📊 Integration Test Summary:', 'blue');
    log(`   Backend Services: ${healthyServices}/${totalServices} healthy`);
    log(`   Frontend: ${frontendHealthy ? '✅ Accessible' : '❌ Not accessible'}`);
    
    if (healthyServices === totalServices && frontendHealthy) {
        log('\n🎉 All integration tests passed!', 'green');
        log('✅ System is ready for development', 'green');
        process.exit(0);
    } else {
        log('\n❌ Some integration tests failed', 'red');
        log('🔧 Please check the issues above and restart services if needed', 'yellow');
        process.exit(1);
    }
}

// Run the tests
runIntegrationTests().catch(error => {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
    process.exit(1);
}); 