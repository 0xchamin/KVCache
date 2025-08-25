class ComputationComparison {
    constructor(container) {
        this.container = container;
        this.tokens = [];
        this.currentPosition = 0;
        this.isAnimating = false;
        this.animationSpeed = 1500;
        
        this.withoutKVStats = { computations: 0, operations: [] };
        this.withKVStats = { computations: 0, cached: 0 };
        
        this.initializeDOM();
    }
    
    initializeDOM() {
        this.container.innerHTML = `
            <div class="comparison-panels">
                <div class="comparison-panel without-kv">
                    <h3>Without KV-Cache</h3>
                    <div class="computation-counter">
                        <span class="counter-label">Total Computations:</span>
                        <span class="counter-value" id="without-counter">0</span>
                    </div>
                    <div class="token-grid" id="without-grid"></div>
                    <div class="computation-grid-container">
                        <div class="computation-grid" id="without-matrix"></div>
                        
                        
                    </div>
                    <div class="complexity-indicator">O(n²) Complexity</div>
                </div>
                
                <div class="comparison-panel with-kv">
                    <h3>With KV-Cache</h3>
                    <div class="computation-counter">
                        <span class="counter-label">Total Computations:</span>
                        <span class="counter-value" id="with-counter">0</span>
                    </div>
                    <div class="token-grid" id="with-grid"></div>
                    <div class="grid-and-description">
                        <div class="computation-grid-container">
                            <div class="computation-grid" id="with-matrix"></div>
                        </div>
                        <div class="description-box" id="cache-description">
                            <h4>Cache Status</h4>
                            <div id="cache-explanation">Select a mode and process tokens to see cache behavior</div>
                        </div>
                    </div>   
                    <div class="cache-stats">
                        <span>Cached: <span id="cached-count">0</span></span>
                    </div>
                    <div class="complexity-indicator">O(n) Complexity</div>
                </div>

            </div>
        `;
    }

    startComparison(tokens, orchestrationMode = 'basic') {
        this.tokens = tokens;
        this.orchestrationMode = orchestrationMode;
        this.currentPosition = 0;
        this.resetStats();
        this.isAnimating = true;
        this.createMatrix('without-matrix', this.tokens.length);
        this.createMatrix('with-matrix', this.tokens.length);
        this.animateNextToken();
    }
    
    animateNextToken() {
        if (!this.isAnimating || this.currentPosition >= this.tokens.length) {
            this.isAnimating = false;
            return;
        }
        
        const currentToken = this.tokens[this.currentPosition];
        
        // Animate without KV-Cache (left side)
        this.animateWithoutKV(currentToken);
        
        // Animate with KV-Cache (right side)  
        this.animateWithKV(currentToken);
        
        this.currentPosition++;
        
        setTimeout(() => {
            this.animateNextToken();
        }, this.animationSpeed);
    }
    
    animateWithoutKV(token) {
        const grid = document.getElementById('without-grid');
        const counter = document.getElementById('without-counter');
        
        // Add current token
        const tokenElement = this.createTokenElement(token, this.currentPosition);
        grid.appendChild(tokenElement);
        
        // Show all computations for this token
        const computationsForToken = this.currentPosition + 1; // Including self-attention
        this.withoutKVStats.computations += computationsForToken;
        
        // Animate computation lines
        this.showComputationLines(grid, this.currentPosition, 'without');
        
        // Update counter
        counter.textContent = this.withoutKVStats.computations;
        counter.style.color = '#e74c3c';

        this.animateTriangle('without-matrix', this.currentPosition);

    }

    animateWithKV(token) {
        const grid = document.getElementById('with-grid');
        const counter = document.getElementById('with-counter');
        const cachedCount = document.getElementById('cached-count');
        
        // Add current token
        const tokenElement = this.createTokenElement(token, this.currentPosition);
        tokenElement.classList.add('kv-cached');
        grid.appendChild(tokenElement);
        
        // Computation logic based on orchestration mode
        switch(this.orchestrationMode) {
            case 'basic':
            case 'self-attention':
                // With KV-Cache: only 1 new computation per token
                this.withKVStats.computations += 1;
                this.withKVStats.cached += this.currentPosition;
                break;
            case 'shared-cache':
                const cacheHitChance = this.currentPosition > 0 ? 0.3 : 0;
                if (Math.random() < cacheHitChance) {
                    // Cache hit - no new computation needed
                    this.withKVStats.cached += this.currentPosition + 1;
                    this.updateDescription(`Cache HIT for "${token}" - reusing cached computation!`);
                } else {
                    // Cache miss - need computation
                    this.withKVStats.computations += 1;
                    this.withKVStats.cached += this.currentPosition;
                    this.updateDescription(`Cache MISS for "${token}" - computing new attention weights`);
                }
                break;


            default:
                // Default to basic behavior
                this.withKVStats.computations += 1;
                this.withKVStats.cached += this.currentPosition;
        }
        
        // Show cache reuse
        this.showCacheReuse(grid, this.currentPosition);
        
        // Update counters
        counter.textContent = this.withKVStats.computations;
        counter.style.color = '#2ecc71';
        cachedCount.textContent = this.withKVStats.cached;

        this.animateLinear('with-matrix', this.currentPosition);
    }

    
    // animateWithKV(token) {
    //     const grid = document.getElementById('with-grid');
    //     const counter = document.getElementById('with-counter');
    //     const cachedCount = document.getElementById('cached-count');
        
    //     // Add current token
    //     const tokenElement = this.createTokenElement(token, this.currentPosition);
    //     tokenElement.classList.add('kv-cached');
    //     grid.appendChild(tokenElement);
        
    //     switch(this.orchestrationMode) {
    //         case 'basic':
    //         case 'self-attention':
    //             // With KV-Cache: only 1 new computation per token
    //             this.withKVStats.computations += 1;
    //             this.withKVStats.cached += this.currentPosition; // Previous tokens are cache
    //             break;
    //         case 'shared-cache':
    //             // Reduce computations for cache hits
    //             break;
    //         default:
    //             // Default to basic behavior
    //     }

        
    //     // Show cache reuse
    //     this.showCacheReuse(grid, this.currentPosition);
        
    //     // Update counters
    //     counter.textContent = this.withKVStats.computations;
    //     counter.style.color = '#2ecc71';
    //     cachedCount.textContent = this.withKVStats.cached;

    //     this.animateLinear('with-matrix', this.currentPosition);

    // }
    
    createTokenElement(token, position) {
        const element = document.createElement('div');
        element.className = 'token-element';
        element.textContent = token;
        element.dataset.position = position;
        return element;
    }
    
    showComputationLines(grid, currentPos, type) {
        // Animate lines showing all computations
        for (let i = 0; i <= currentPos; i++) {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = `computation-line ${type}`;
                line.style.left = `${i * 60}px`;
                line.style.top = `${currentPos * 40}px`;
                line.style.width = `${Math.abs(currentPos - i) * 60 + 40}px`;
                grid.appendChild(line);
                
                setTimeout(() => line.remove(), 800);
            }, i * 100);
        }
    }
    
    showCacheReuse(grid, currentPos) {
        // Show cache hit indicators
        const cacheHit = document.createElement('div');
        cacheHit.className = 'cache-hit-indicator';
        cacheHit.textContent = '💾';
        cacheHit.style.left = `${currentPos * 60}px`;
        cacheHit.style.top = `${currentPos * 40 - 20}px`;
        grid.appendChild(cacheHit);
        
        setTimeout(() => cacheHit.remove(), 1000);
    }

    createMatrix(gridId, size) {
        const grid = document.getElementById(gridId);
        grid.style.gridTemplateColumns = `repeat(${size}, 20px)`;
        grid.style.gridTemplateRows = `repeat(${size}, 20px)`;
        grid.innerHTML = '';

        // Create axis labels
        const xLabelsId = gridId.replace('matrix', 'x-labels');
        const yLabelsId = gridId.replace('matrix', 'y-labels');
    
        //this.createAxisLabels(xLabelsId, yLabelsId, size);
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col <= row; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.gridRow = row + 1;
                cell.style.gridColumn = col + 1;
                grid.appendChild(cell);
            }
        }
    }

    createAxisLabels(xLabelsId, yLabelsId, size) {
        const xLabels = document.getElementById(xLabelsId);
        const yLabels = document.getElementById(yLabelsId);
        
        xLabels.innerHTML = '';
        yLabels.innerHTML = '';
        
        // Add token labels to both axes
        for (let i = 0; i < size; i++) {
            const token = this.tokens[i];
            
            // X-axis label
            const xLabel = document.createElement('span');
            xLabel.textContent = token;
            xLabel.style.left = `${i * 22}px`;
            xLabels.appendChild(xLabel);
            
            // Y-axis label  
            const yLabel = document.createElement('span');
            yLabel.textContent = token;
            yLabel.style.top = `${i * 22}px`;
            yLabels.appendChild(yLabel);
        }
    }


    animateTriangle(gridId, tokenIndex) {
        const grid = document.getElementById(gridId);
        const cells = grid.querySelectorAll(`[data-row="${tokenIndex}"]`);
        
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.add('active');
            }, index * 100);
        });
    }

    animateLinear(gridId, tokenIndex) {
        const grid = document.getElementById(gridId);
        const cell = grid.querySelector(`[data-row="${tokenIndex}"][data-col="0"]`);
        
        if (cell) {
            cell.classList.add('active');
            cell.style.background = '#2ecc71'; // Green for KV-cache
        }
    }


    updateDescription(message) {
        const descriptionElement = document.getElementById('cache-explanation');
        if (descriptionElement) {
            descriptionElement.textContent = message;
            
            // Add visual feedback
            descriptionElement.style.background = '#e8f5e8';
            setTimeout(() => {
                descriptionElement.style.background = 'transparent';
            }, 1000);
        }
    }


    
    resetStats() {
        this.withoutKVStats = { computations: 0, operations: [] };
        this.withKVStats = { computations: 0, cached: 0 };
        
        document.getElementById('without-counter').textContent = '0';
        document.getElementById('with-counter').textContent = '0';
        document.getElementById('cached-count').textContent = '0';
        
        document.getElementById('without-grid').innerHTML = '';
        document.getElementById('with-grid').innerHTML = '';
    }
    
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }
    
    stop() {
        this.isAnimating = false;
    }
}

export default ComputationComparison;
