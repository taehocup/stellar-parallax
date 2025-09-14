class ParallaxSimulator {
    constructor() {
        this.canvas = document.getElementById('parallax-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        this.isAnimating = false;

        this.earthPosition = 0;
        this.starDistance = 10;

        this.AU = 50;
        this.scale = 4;

        this.setupCanvas();
        this.bindEvents();
        this.updateDisplay();
        this.draw();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
    }

    bindEvents() {
        const distanceSlider = document.getElementById('distance-slider');
        const positionSlider = document.getElementById('earth-position');
        const animateBtn = document.getElementById('animate-btn');

        distanceSlider.addEventListener('input', (e) => {
            this.starDistance = parseFloat(e.target.value);
            this.updateDisplay();
            this.draw();
        });

        positionSlider.addEventListener('input', (e) => {
            this.earthPosition = parseFloat(e.target.value);
            this.updateDisplay();
            this.draw();
        });

        animateBtn.addEventListener('click', () => {
            this.toggleAnimation();
        });

        document.querySelectorAll('.star-card').forEach(card => {
            card.addEventListener('click', () => {
                const distance = parseFloat(card.dataset.distance);
                const parallax = parseFloat(card.dataset.parallax);

                this.starDistance = distance;
                distanceSlider.value = distance;
                this.updateDisplay();
                this.draw();

                this.highlightCard(card);
            });
        });

        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleQuizAnswer(e.target);
            });
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }

    calculateParallax() {
        return 1 / this.starDistance;
    }

    updateDisplay() {
        const parallaxAngle = this.calculateParallax();
        const distanceLY = this.starDistance * 3.26;

        document.getElementById('distance-value').textContent = this.starDistance;
        document.getElementById('position-value').textContent = Math.round(this.earthPosition);
        document.getElementById('parallax-angle').textContent = parallaxAngle.toFixed(3);
        document.getElementById('calculated-distance').textContent = this.starDistance.toFixed(1);
        document.getElementById('distance-ly').textContent = distanceLY.toFixed(1);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawSun();
        this.drawEarthOrbit();
        this.drawEarth();
        this.drawStar();
        this.drawParallaxLines();
        this.drawLabels();
    }

    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(this.centerX, this.centerY)
        );
        gradient.addColorStop(0, 'rgba(10, 25, 70, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 5, 20, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawSun() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 15
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.7, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 12, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x1 = this.centerX + Math.cos(angle) * 18;
            const y1 = this.centerY + Math.sin(angle) * 18;
            const x2 = this.centerX + Math.cos(angle) * 25;
            const y2 = this.centerY + Math.sin(angle) * 25;

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }

    drawEarthOrbit() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.AU, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawEarth() {
        const earthAngle = (this.earthPosition * Math.PI) / 180;
        const earthX = this.centerX + Math.cos(earthAngle) * this.AU;
        const earthY = this.centerY + Math.sin(earthAngle) * this.AU;

        const gradient = this.ctx.createRadialGradient(earthX, earthY, 0, earthX, earthY, 8);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(0.7, '#2E5984');
        gradient.addColorStop(1, '#1A365D');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(earthX, earthY, 6, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(earthX - 2, earthY - 1, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(earthX + 1, earthY + 2, 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        this.earthX = earthX;
        this.earthY = earthY;
    }

    drawStar() {
        const starX = this.centerX + this.starDistance * this.scale * 15;
        const starY = this.centerY - 80;

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.drawStarShape(starX, starY, 5, 8, 4);
        this.ctx.fill();

        const glowGradient = this.ctx.createRadialGradient(starX, starY, 0, starX, starY, 20);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        glowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(starX, starY, 20, 0, Math.PI * 2);
        this.ctx.fill();

        this.starX = starX;
        this.starY = starY;
    }

    drawStarShape(x, y, spikes, outerRadius, innerRadius) {
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        this.ctx.moveTo(x, y - outerRadius);

        for (let i = 0; i < spikes; i++) {
            const xOuter = x + Math.cos(rot) * outerRadius;
            const yOuter = y + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(xOuter, yOuter);
            rot += step;

            const xInner = x + Math.cos(rot) * innerRadius;
            const yInner = y + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(xInner, yInner);
            rot += step;
        }

        this.ctx.lineTo(x, y - outerRadius);
    }

    drawParallaxLines() {
        const earthAngle1 = (this.earthPosition * Math.PI) / 180;
        const earthAngle2 = ((this.earthPosition + 180) * Math.PI) / 180;

        const earth1X = this.centerX + Math.cos(earthAngle1) * this.AU;
        const earth1Y = this.centerY + Math.sin(earthAngle1) * this.AU;
        const earth2X = this.centerX + Math.cos(earthAngle2) * this.AU;
        const earth2Y = this.centerY + Math.sin(earthAngle2) * this.AU;

        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);

        this.ctx.beginPath();
        this.ctx.moveTo(earth1X, earth1Y);
        this.ctx.lineTo(this.starX, this.starY);
        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(earth2X, earth2Y);
        this.ctx.lineTo(this.starX, this.starY);
        this.ctx.stroke();

        this.ctx.setLineDash([]);

        const parallaxAngle = this.calculateParallax() * (Math.PI / 180) * (1/3600) * 1000;
        const arcRadius = 40;

        this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();

        const angle1 = Math.atan2(earth1Y - this.starY, earth1X - this.starX);
        const angle2 = Math.atan2(earth2Y - this.starY, earth2X - this.starX);
        const startAngle = Math.min(angle1, angle2);
        const endAngle = Math.max(angle1, angle2);

        this.ctx.arc(this.starX, this.starY, arcRadius, startAngle, endAngle);
        this.ctx.stroke();
    }

    drawLabels() {
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.textAlign = 'center';

        this.ctx.fillText('태양', this.centerX, this.centerY + 30);
        this.ctx.fillText('지구', this.earthX, this.earthY - 15);
        this.ctx.fillText('관측 대상 별', this.starX, this.starY - 25);

        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`거리: ${this.starDistance} 파섹`, this.starX, this.starY + 30);
        this.ctx.fillText(`시차: ${this.calculateParallax().toFixed(3)}"`, this.starX, this.starY + 45);

        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        const midX = (this.earthX + this.starX) / 2;
        const midY = (this.earthY + this.starY) / 2;
        this.ctx.fillText('관측선', midX, midY - 10);
    }

    toggleAnimation() {
        const animateBtn = document.getElementById('animate-btn');

        if (this.isAnimating) {
            this.stopAnimation();
            animateBtn.textContent = '궤도 애니메이션 시작';
        } else {
            this.startAnimation();
            animateBtn.textContent = '애니메이션 정지';
        }
    }

    startAnimation() {
        this.isAnimating = true;
        const animate = () => {
            if (!this.isAnimating) return;

            this.earthPosition = (this.earthPosition + 2) % 360;
            document.getElementById('earth-position').value = this.earthPosition;
            this.updateDisplay();
            this.draw();

            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    highlightCard(selectedCard) {
        document.querySelectorAll('.star-card').forEach(card => {
            card.style.boxShadow = '';
            card.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        });

        selectedCard.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
        selectedCard.style.border = '2px solid #FFD700';

        setTimeout(() => {
            selectedCard.style.boxShadow = '';
            selectedCard.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        }, 3000);
    }

    handleQuizAnswer(selectedOption) {
        const feedback = document.getElementById('quiz-feedback');
        const options = document.querySelectorAll('.quiz-option');

        options.forEach(option => {
            option.disabled = true;
            if (option.dataset.answer === 'correct') {
                option.classList.add('correct');
            } else {
                option.classList.add('wrong');
            }
        });

        if (selectedOption.dataset.answer === 'correct') {
            feedback.textContent = '정답입니다! 시차각이 0.5 각초인 별까지의 거리는 1/0.5 = 2 파섹입니다.';
            feedback.className = 'quiz-feedback correct';
        } else {
            feedback.textContent = '틀렸습니다. 거리(파섹) = 1 / 시차각(각초) 공식을 사용하세요. 정답은 2 파섹입니다.';
            feedback.className = 'quiz-feedback wrong';
        }

        setTimeout(() => {
            options.forEach(option => {
                option.disabled = false;
                option.classList.remove('correct', 'wrong');
            });
            feedback.textContent = '';
            feedback.className = 'quiz-feedback';
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParallaxSimulator();
});