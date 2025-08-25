class AttentionHead {
    constructor(headId, specialization, container) {
        this.headId = headId;
        this.specialization = specialization;
        this.container = container;
        this.orchestrationMode = 'basic'; // New property
        
        this.keyCache = [];
        this.valueCache = [];
        this.tokenSequence = [];
        
        this.theme = this.getTheme(specialization);
        this.initializeDOM();
    }
    
    // New method for orchestration
    setOrchestrationMode(mode) {
        this.orchestrationMode = mode;
        this.updateModeIndicator(mode);
    }
    
    updateModeIndicator(mode) {
        const header = this.container.querySelector('.head-header');
        let indicator = header.querySelector('.mode-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'mode-indicator';
            header.appendChild(indicator);
        }
        indicator.textContent = `[${mode}]`;
        indicator.style.fontSize = '0.8rem';
        indicator.style.color = '#7f8c8d';
    }
    
    // Cross-head communication method
    receiveSharedInfo(otherHeads) {
        if (this.orchestrationMode !== 'cross-head') return;
        
        const sharedInfo = otherHeads.map(head => ({
            specialization: head.specialization,
            cacheSize: head.keyCache.length,
            lastToken: head.tokenSequence[head.tokenSequence.length - 1]
        }));
        
        this.visualizeSharedInfo(sharedInfo);
    }
    
    visualizeSharedInfo(sharedInfo) {
        const weightsContainer = this.container.querySelector('.attention-weights');
        const sharedDiv = document.createElement('div');
        sharedDiv.className = 'shared-info';
        sharedDiv.innerHTML = `<small>Shared: ${sharedInfo.length} heads</small>`;
        sharedDiv.style.color = this.theme.color;
        weightsContainer.appendChild(sharedDiv);
    }
    
    //self-attention
    processTokenWithSelfAttention(token, position) {
    // Add current token to cache first
    const key = this.generateKey(token, position);
    const value = this.generateValue(token, position);
    
    this.keyCache.push(key);
    this.valueCache.push(value);
    this.tokenSequence.push(token);
    
    this.animateTokenAddition(key, value, token);
    }

    computeSelfAttention(queryToken) {
        const weights = [];
        
        // Include current token in attention computation
        this.keyCache.forEach((key, index) => {
            const weight = this.calculateAttentionWeight(queryToken, key, index);
            weights.push(weight);
        });
        
        this.visualizeAttentionWeights(weights);
        return weights;
    }

    
    // Shared cache methods
    processTokenWithSharedCache(token, position, sharedCache) {
        // Check shared cache first
        const sharedKey = `${token}_${position}`;
        if (sharedCache.has(sharedKey)) {
            this.visualizeCacheHit(token);
        }
        
        // Process normally
        this.processToken(token, position);
    }
    
    computeAttentionWithSharedCache(queryToken, sharedCache) {
        const weights = this.computeAttention(queryToken);
        
        // Boost weights for tokens in shared cache
        return weights.map((weight, index) => {
            const token = this.tokenSequence[index];
            const sharedKey = `${token}_${index}`;
            return sharedCache.has(sharedKey) ? weight * 1.2 : weight;
        });
    }
    
    visualizeCacheHit(token) {
        const header = this.container.querySelector('.head-header');
        const hitIndicator = document.createElement('span');
        hitIndicator.textContent = '💾';
        hitIndicator.title = `Cache hit for ${token}`;
        header.appendChild(hitIndicator);
        
        setTimeout(() => hitIndicator.remove(), 1000);
    }
    
    // Dynamic allocation method
    processTokenWithAllocation(token, position, allocation) {
        // Scale processing based on allocation
        const key = this.generateKey(token, position);
        const value = this.generateValue(token, position);
        
        // Simulate allocation effect
        if (allocation > 1.0) {
            value.enhanced = true;
            value.allocation = allocation;
        }
        
        this.keyCache.push(key);
        this.valueCache.push(value);
        this.tokenSequence.push(token);
        
        this.animateTokenAddition(key, value, token);
        this.visualizeAllocation(allocation);
    }
    
    visualizeAllocation(allocation) {
        const header = this.container.querySelector('.head-header');
        let allocIndicator = header.querySelector('.alloc-indicator');
        if (!allocIndicator) {
            allocIndicator = document.createElement('span');
            allocIndicator.className = 'alloc-indicator';
            header.appendChild(allocIndicator);
        }
        allocIndicator.textContent = `${allocation.toFixed(1)}x`;
        allocIndicator.style.color = allocation > 1.0 ? '#e74c3c' : '#2ecc71';
        allocIndicator.style.fontSize = '0.8rem';
    }
    
    // Keep all existing methods unchanged
    getTheme(specialization) {
        const themes = {
            'syntax': { color: '#3498db', icon: '🔤', label: 'Syntax' },
            'semantic': { color: '#2ecc71', icon: '🧠', label: 'Semantic' },
            'positional': { color: '#e74c3c', icon: '📍', label: 'Position' },
            'long-range': { color: '#9b59b6', icon: '🔗', label: 'Long-range' }
        };
        return themes[specialization] || themes['syntax'];
    }
    
    initializeDOM() {
        this.container.innerHTML = `
            <div class="attention-head" style="border-color: ${this.theme.color}">
                <div class="head-header">
                    <span class="head-icon">${this.theme.icon}</span>
                    <span class="head-label">${this.theme.label}</span>
                </div>
                <div class="cache-container">
                    <div class="keys-section">
                        <h4>Keys</h4>
                        <div class="cache-items keys"></div>
                    </div>
                    <div class="values-section">
                        <h4>Values</h4>
                        <div class="cache-items values"></div>
                    </div>
                </div>
                <div class="attention-weights"></div>
            </div>
        `;
    }
    
    processToken(token, position) {
        const key = this.generateKey(token, position);
        const value = this.generateValue(token, position);
        
        this.keyCache.push(key);
        this.valueCache.push(value);
        this.tokenSequence.push(token);
        
        this.animateTokenAddition(key, value, token);
        
        return { key, value };
    }
    
    generateKey(token, position) {
        switch(this.specialization) {
            case 'syntax':
                return `${token}_syntax_${position}`;
            case 'semantic':
                return `${token}_meaning_${this.getSementicContext(token)}`;
            case 'positional':
                return `pos_${position}_${token}`;
            case 'long-range':
                return `${token}_context_${this.getLongRangeContext(position)}`;
            default:
                return `${token}_${position}`;
        }
    }
    
    generateValue(token, position) {
        return {
            token: token,
            position: position,
            embedding: this.getSimulatedEmbedding(token),
            specialization: this.specialization
        };
    }
    
    computeAttention(queryToken) {
        const weights = [];
        
        this.keyCache.forEach((key, index) => {
            const weight = this.calculateAttentionWeight(queryToken, key, index);
            weights.push(weight);
        });
        
        this.visualizeAttentionWeights(weights);
        
        return weights;
    }
    
    calculateAttentionWeight(query, key, index) {
        let baseWeight = Math.random() * 0.5 + 0.1;
        
        switch(this.specialization) {
            case 'syntax':
                if (this.isSyntacticallyRelated(query, this.tokenSequence[index])) {
                    baseWeight += 0.4;
                }
                break;
            case 'semantic':
                if (this.isSemanticallyRelated(query, this.tokenSequence[index])) {
                    baseWeight += 0.4;
                }
                break;
            case 'positional':
                baseWeight += (1 / (this.keyCache.length - index + 1)) * 0.5;
                break;
            case 'long-range':
                if (index < this.keyCache.length * 0.3) {
                    baseWeight += 0.3;
                }
                break;
        }
        
        return Math.min(baseWeight, 1.0);
    }
    
    animateTokenAddition(key, value, token) {
        const keysContainer = this.container.querySelector('.cache-items.keys');
        const valuesContainer = this.container.querySelector('.cache-items.values');
        
        const keyElement = document.createElement('div');
        keyElement.className = 'cache-item key-item';
        keyElement.textContent = key;
        keyElement.style.backgroundColor = this.theme.color + '20';
        keyElement.style.borderColor = this.theme.color;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'cache-item value-item';
        valueElement.textContent = `${token} (${value.specialization})`;
        valueElement.style.backgroundColor = this.theme.color + '20';
        valueElement.style.borderColor = this.theme.color;
        
        keyElement.style.opacity = '0';
        valueElement.style.opacity = '0';
        
        keysContainer.appendChild(keyElement);
        valuesContainer.appendChild(valueElement);
        
        setTimeout(() => {
            keyElement.style.opacity = '1';
            valueElement.style.opacity = '1';
        }, 100);
    }
    
    visualizeAttentionWeights(weights) {
        const weightsContainer = this.container.querySelector('.attention-weights');
        weightsContainer.innerHTML = '<h4>Attention Weights</h4>';
        
        weights.forEach((weight, index) => {
            const weightBar = document.createElement('div');
            weightBar.className = 'weight-bar';
            weightBar.style.width = `${weight * 100}%`;
            weightBar.style.backgroundColor = this.theme.color;
            weightBar.style.height = '8px';
            weightBar.style.margin = '2px 0';
            weightBar.title = `Token ${index}: ${weight.toFixed(3)}`;
            
            weightsContainer.appendChild(weightBar);
        });
    }
    
    clearCache() {
        this.keyCache = [];
        this.valueCache = [];
        this.tokenSequence = [];
        
        this.container.querySelector('.cache-items.keys').innerHTML = '';
        this.container.querySelector('.cache-items.values').innerHTML = '';
        this.container.querySelector('.attention-weights').innerHTML = '';
        
        // Clear indicators
        const indicators = this.container.querySelectorAll('.mode-indicator, .alloc-indicator');
        indicators.forEach(indicator => indicator.remove());
    }
    
    // Helper methods (unchanged)
    getSementicContext(token) {
        const semanticGroups = {
            'cat': 'animal', 'dog': 'animal', 'bird': 'animal',
            'run': 'action', 'jump': 'action', 'walk': 'action',
            'red': 'color', 'blue': 'color', 'green': 'color'
        };
        return semanticGroups[token.toLowerCase()] || 'general';
    }
    
    getLongRangeContext(position) {
        return Math.floor(position / 5);
    }
    
    getSimulatedEmbedding(token) {
        return Array(4).fill(0).map(() => Math.random());
    }
    
    isSyntacticallyRelated(token1, token2) {
        const verbs = ['run', 'jump', 'walk', 'eat', 'sleep'];
        const nouns = ['cat', 'dog', 'house', 'car', 'book'];
        
        return (verbs.includes(token1) && nouns.includes(token2)) ||
               (nouns.includes(token1) && verbs.includes(token2));
    }
    
    isSemanticallyRelated(token1, token2) {
        const animalWords = ['cat', 'dog', 'bird', 'fish'];
        const actionWords = ['run', 'jump', 'walk', 'fly'];
        
        return (animalWords.includes(token1) && animalWords.includes(token2)) ||
               (actionWords.includes(token1) && actionWords.includes(token2));
    }
}

export default AttentionHead;
