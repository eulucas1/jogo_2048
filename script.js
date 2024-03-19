document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const tamanho = 4;
    let quadro = [];
    let pontuacaoAtual = 0;
    const pontuacaoAtualElem = document.getElementById('pontuacao-atual');

    let pontuacaoRecorde = localStorage.getItem('2048-pontuacaoRecorde') || 0;
    const pontuacaoRecordeElem = document.getElementById('pontuacao-recorde');
    pontuacaoRecordeElem.textContent = pontuacaoRecorde;
    const fimDeJogoElem = document.getElementById('fim-de-jogo');

    function atualizaPontuacao(value) {
        pontuacaoAtual += value;
        pontuacaoAtualElem.textContent = pontuacaoAtual;
        if (pontuacaoAtual > pontuacaoRecorde) {
            pontuacaoRecorde = pontuacaoAtual;
            pontuacaoRecordeElem.textContent = pontuacaoRecorde;
            localStorage.setItem('2048-pontuacaoRecorde', pontuacaoRecorde);
        }
    }

    function reiniciarJogo() {
        pontuacaoAtual = 0;
        pontuacaoAtualElem.textContent = '0';
        fimDeJogoElem.style.display = 'none';
        iniciarJogo();
    }

    function iniciarJogo() {
        quadro = [...Array(tamanho)].map(e => Array(tamanho).fill(0));
        posicaoAleatoria();
        posicaoAleatoria();
        renderQuadro();
    }

    function renderQuadro() {
        for (let i = 0; i < tamanho; i++) {
            for (let j = 0; j < tamanho; j++) {
                const quadrado = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const proximoValor = quadrado.dataset.value;
                const valorAtual = quadro[i][j];
                if (valorAtual !== 0) {
                    quadrado.dataset.value = valorAtual;
                    quadrado.textContent = valorAtual;
                    if (valorAtual !== parseInt(proximoValor) && !quadrado.classList.contains('new-tile')) {
                        quadrado.classList.add('merged-tile');
                    }
                } else {
                    quadrado.textContent = '';
                    delete quadrado.dataset.value;
                    quadrado.classList.remove('merged-tile', 'new-tile');
                }
            }
        }

        setTimeout(() => {
            const todosQuadrados = document.querySelectorAll('.grid-quadrado');
            todosQuadrados.forEach(quadrado => {
                quadrado.classList.remove('merged-tile', 'new-tile');
            });
        }, 300);
    }

    function posicaoAleatoria() {
        const avaliar = [];
        for (let i = 0; i < tamanho; i++) {
            for (let j = 0; j < tamanho; j++) {
                if (quadro[i][j] === 0) {
                    avaliar.push({ x: i, y: j });
                }
            }
        }

        if (avaliar.length > 0) {
            const quadradoAleatorio = avaliar[Math.floor(Math.random() * avaliar.length)];
            quadro[quadradoAleatorio.x][quadradoAleatorio.y] = Math.random() < 0.9 ? 2 : 4;
            const quadrado = document.querySelector(`[data-row="${quadradoAleatorio.x}"][data-col="${quadradoAleatorio.y}"]`);
            quadrado.classList.add('new-tile');
        }
    }

    function movimento(direcao) {
        let temMudanca = false;
        if (direcao === 'ArrowUp' || direcao === 'ArrowDown') {
            for (let j = 0; j < tamanho; j++) {
                const coluna = [...Array(tamanho)].map((_, i) => quadro[i][j]);
                const novaColuna = transforma(coluna, direcao === 'ArrowUp');
                for (let i = 0; i < tamanho; i++) {
                    if (quadro[i][j] !== novaColuna[i]) {
                        temMudanca = true;
                        quadro[i][j] = novaColuna[i];
                    }
                }
            }
        } else if (direcao === 'ArrowLeft' || direcao === 'ArrowRight') {
            for (let i = 0; i < tamanho; i++) {
                const linhaQuadro = quadro[i];
                const novaLinhaQuadro = transforma(linhaQuadro, direcao === 'ArrowLeft');
                if (linhaQuadro.join(',') !== novaLinhaQuadro.join(',')) {
                    temMudanca = true;
                    quadro[i] = novaLinhaQuadro;
                }
            }
        }
        if (temMudanca) {
            posicaoAleatoria();
            renderQuadro();
            verificaFimDeJogo();
        }
    }

    function transforma(linha, movimentoInicial) {
        let novaLinha = linha.filter(quadrado => quadrado !== 0);
        if (!movimentoInicial) {
            novaLinha.reverse();
        }
        for (let i = 0; i < novaLinha.length - 1; i++) {
            if (novaLinha[i] === novaLinha[i + 1]) {
                novaLinha[i] *= 2;
                atualizaPontuacao(novaLinha[i]);
                novaLinha.splice(i + 1, 1);
            }
        }
        while (novaLinha.length < tamanho) {
            novaLinha.push(0);
        }
        if (!movimentoInicial) {
            novaLinha.reverse();
        }
        return novaLinha;
    }

    function verificaFimDeJogo() {
        for (let i = 0; i < tamanho; i++) {
            for (let j = 0; j < tamanho; j++) {
                if (quadro[i][j] === 0) {
                    return;
                }
                if (j < tamanho - 1 && quadro[i][j] === quadro[i][j + 1]) {
                    return;
                }
                if (i < tamanho - 1 && quadro[i][j] === quadro[i + 1][j]) {
                    return;
                }
            }
        }

        fimDeJogoElem.style.display = 'flex';
    }

    document.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            movimento(event.key);
        }
    });

    // Corrigindo o seletor para adicionar suporte a toque
    const touchSurface = document.querySelector('.jogo-container .grid');
    let startX, startY, distX, distY;

    touchSurface.addEventListener('touchstart', e => {
        const touchObj = e.changedTouches[0];
        startX = touchObj.pageX;
        startY = touchObj.pageY;
    });

    touchSurface.addEventListener('touchmove', e => {
        e.preventDefault();
    });

    touchSurface.addEventListener('touchend', e => {
        const touchObj = e.changedTouches[0];
        distX = touchObj.pageX - startX;
        distY = touchObj.pageY - startY;

        if (Math.abs(distX) > Math.abs(distY)) {
            if (distX > 0) {
                movimento('ArrowRight');
            } else {
                movimento('ArrowLeft');
            }
        } else {
            if (distY > 0) {
                movimento('ArrowDown');
            } else {
                movimento('ArrowUp');
            }
        }
    });

    document.getElementById('reiniciar-btn').addEventListener('click', reiniciarJogo);

    iniciarJogo();
});