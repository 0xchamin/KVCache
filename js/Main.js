import AttentionHead from './AttentionHead.js';
import TokenPipeline from './TokenPipeline.js';
import OrchestrationManager from './OrchestrationManager.js';
import ComputationComparison from './ComputationComparison.js';

class KVCacheDemo {
    constructor() {
        this.attentionHeads = [];
        this.tokenPipeline = null;
        this.orchestrationManager = null;
        this.computationComparison = null
        this.init();
    }
    
    init() {
        this.createAttentionHeads();
        this.createOrchestrationManager();
        this.createComputationComparison(); 
        this.createTokenPipeline();
        this.setupGlobalControls();
    }

    createOrchestrationManager() {
        this.orchestrationManager = new OrchestrationManager(this.attentionHeads);
    }
    
    createComputationComparison() {
    const container = document.getElementById('computation-comparison-container');
    this.computationComparison = new ComputationComparison(container);
    }

    
    createAttentionHeads() {
        const headConfigs = [
            { id: 'head-1', specialization: 'syntax' },
            { id: 'head-2', specialization: 'semantic' },
            { id: 'head-3', specialization: 'positional' },
            { id: 'head-4', specialization: 'long-range' }
        ];
        
        headConfigs.forEach(config => {
            const container = document.getElementById(config.id);
            const head = new AttentionHead(config.id, config.specialization, container);
            this.attentionHeads.push(head);
        });
    }
    
    createTokenPipeline() {
        const pipelineContainer = document.getElementById('token-pipeline-container');
        this.tokenPipeline = new TokenPipeline(
            pipelineContainer, 
            this.attentionHeads, 
            this.orchestrationManager,
            this.computationComparison
        );
        //this.tokenPipeline = new TokenPipeline(pipelineContainer, this.attentionHeads);
    }
    
    setupGlobalControls() {
        // Add any global demo controls here if needed
        console.log('KV Cache Demo initialized with', this.attentionHeads.length, 'attention heads');
    }
}

// Initialize the demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KVCacheDemo();
});
