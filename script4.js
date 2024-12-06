document.addEventListener('DOMContentLoaded', function () {
    var formData = JSON.parse(localStorage.getItem("formData"));
    var horasRestantes = parseInt(localStorage.getItem("horasRestantes")) || 0;
    var todasSituacoes = JSON.parse(localStorage.getItem("todasSituacoes")) || [];
    var situacaoAtual = parseInt(localStorage.getItem("situacaoAtual")) || 1;
    var respostasSituacoes = JSON.parse(localStorage.getItem('respostasSituacoes')) || {};

    // Função para expandir automaticamente a textarea
    function autoExpand(field) {
        // Reset field height
        field.style.height = 'inherit';

        // Get the computed styles for the element
        var computed = window.getComputedStyle(field);

        // Calculate the height
        var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                     + parseInt(computed.getPropertyValue('padding-top'), 10)
                     + field.scrollHeight
                     + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                     + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

        field.style.height = height + 'px';
    }

    // Adicionar evento de input para auto-expansão
    var textarea = document.getElementById('projetoIntegradorTexto');
    textarea.addEventListener('input', function() {
        autoExpand(this);
    });

    // Função para formatar o texto para o PDF
    function formatarTextoParaPDF(texto, maxCharsPerLine, maxTotalChars) {
        var linhas = [];
        var totalChars = 0;

        while (texto.length > 0 && totalChars < maxTotalChars) {
            var currentLine = texto.substring(0, maxCharsPerLine);
            linhas.push(currentLine);
            totalChars += currentLine.length;
            texto = texto.substring(maxCharsPerLine);
        }

        return linhas.join('\n');
    }

    // Função para adicionar imagem ao PDF
    function adicionarImagemAoPDF(doc, path, x, y, width, height, callback) {
        var img = new Image();
        img.src = path;
        img.onload = function () {
            doc.addImage(img, 'png', x, y, width, height);
            callback();
        }
        img.onerror = function () {
            console.error('Erro ao carregar a imagem:', path);
            callback();
        };
    }

    function adicionarPaginaFinalAoPDF(doc, callback) {
        doc.addPage();
        adicionarImagemAoPDF(doc, 'assets/final.png', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, function () {
            var projetoIntegradorTexto = localStorage.getItem('projetoIntegradorTexto') || '';
            doc.setFontSize(12);
            var projetoIntegradorTextoFormatado = formatarTextoParaPDF(projetoIntegradorTexto, 119, 2141);
            doc.text(projetoIntegradorTextoFormatado, 10, 43,);
            callback();
        });
    }

    function adicionarSituacaoAoPDF(doc, situacaoIndex, callback) {
        if (situacaoIndex >= todasSituacoes.length) {
            adicionarPaginaFinalAoPDF(doc, callback);
            return;
        }

        var situacaoData = todasSituacoes[situacaoIndex];

        // Adicionar a primeira página de "Situação de Aprendizagem"
        doc.addPage();
        adicionarImagemAoPDF(doc, 'assets/situacao_aprendizagem.png', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, function () {
            doc.setFontSize(12);
            var situacaoFormatado = formatarTextoParaPDF(situacaoData.nomeSituacao, 93, 186);
            doc.text(situacaoFormatado, 9, 50);
            doc.text(situacaoData.quantidadeAulas.toString(), 235, 50);
            var indicadoresFormatado = formatarTextoParaPDF(situacaoData.indicadores, 118, 1534);
            doc.text(indicadoresFormatado.toString(), 9, 73);
            var conhecimentosFormatado = formatarTextoParaPDF(situacaoData.conhecimentos, 36, 360);
            doc.text(conhecimentosFormatado.toString(), 9, 157);
            var habilidadesFormatado = formatarTextoParaPDF(situacaoData.habilidades, 36, 360);
            doc.text(habilidadesFormatado.toString(), 104, 157);
            var atitudesFormatado = formatarTextoParaPDF(situacaoData.atitudes, 36, 360);
            doc.text(atitudesFormatado.toString(), 197, 157);

            // Adicionar a segunda página de "Situação de Aprendizagem"
            doc.addPage();
            adicionarImagemAoPDF(doc, 'assets/situacao_aprendizagem2.png', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, function () {
                var contextoTextoFormatado = formatarTextoParaPDF(situacaoData.contexto, 113, 2400);
                doc.text(contextoTextoFormatado, 15, 47);
                doc.text(situacaoData.marcasFormativas.join(', '), 11, 225);

                // Adicionar checkboxes e frases
                var marcas = [
                    'Domínio técnico-científico',
                    'Visão crítica',
                    'Atitude sustentável',
                    'Colaboração e comunicação',
                    'Criatividade e atitude empreendedora',
                    'Autonomia digital'
                ];

                var positions = [
                    { x: 23, y: 172 },
                    { x: 100, y: 172 },
                    { x: 195, y: 172 },
                    { x: 23, y: 185 },
                    { x: 100, y: 185 },
                    { x: 195, y: 185 }
                ];

                var checkboxWidth = 6;
                var checkboxHeight = 6;

                function adicionarCheckboxes(index) {
                    if (index >= marcas.length) {
                        adicionarAulasAoPDF(doc, situacaoIndex, 1, function() {
                            adicionarSituacaoAoPDF(doc, situacaoIndex + 1, callback);
                        });
                        return;
                    }

                    var pos = positions[index];
                    var checkboxImg = situacaoData.marcasFormativas.includes(marcas[index]) ? 'assets/checkbox.png' : 'assets/unchecked.png';
                    adicionarImagemAoPDF(doc, checkboxImg, pos.x, pos.y, checkboxWidth, checkboxHeight, function () {
                        doc.text(marcas[index], pos.x + 7, pos.y + 5);
                        adicionarCheckboxes(index + 1);
                    });
                }

                adicionarCheckboxes(0);
            });
        });
    }

    function adicionarAulasAoPDF(doc, situacaoIndex, aulaIndex, callback) {
    var respostas = respostasSituacoes[situacaoIndex + 1] || {};
    var situacaoData = todasSituacoes[situacaoIndex];
    var cargaHorariaSituacao = parseInt(situacaoData.quantidadeAulas);
    var cargaHorariaAula = parseInt(formData.situAprendizagem);
    
    if (isNaN(cargaHorariaSituacao) || isNaN(cargaHorariaAula) || cargaHorariaAula <= 0) {
        console.error('Erro: valores de carga horária inválidos');
        callback();
        return;
    }

    var totalAulas = Math.ceil(cargaHorariaSituacao / cargaHorariaAula);

    if (aulaIndex > totalAulas) {
        callback();
        return;
    }

        if (respostas[aulaIndex]) {
            doc.addPage();
            adicionarImagemAoPDF(doc, 'assets/aula.png', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, function () {
                doc.text(aulaIndex.toString(), 30, 35.5);
                doc.text(respostas[aulaIndex].atividades.toString(), 16, 55);
                doc.text(respostas[aulaIndex].odas.toString(), 237, 61);
                doc.text(respostas[aulaIndex].procedimentos.toString(), 15, 175);
                adicionarAulasAoPDF(doc, situacaoIndex, aulaIndex + 1, callback);
            });
        } else {
            adicionarAulasAoPDF(doc, situacaoIndex, aulaIndex + 1, callback);
        }
    }

    function atualizarEstadoBotoes(estado) {
        document.getElementById('projetoIntegradorTexto').disabled = estado;
        document.getElementById('saveBtn').disabled = estado;
        document.getElementById('editBtn').style.display = estado ? 'inline' : 'none';
        document.getElementById('generatePdfBtn').disabled = !estado;
    }

    // Inicialmente, desabilitar o botão "Gerar PDF"
    document.getElementById('generatePdfBtn').disabled = true;

    // Evento de clique no botão de salvar
    document.getElementById('saveBtn').addEventListener('click', function (event) {
        event.preventDefault();
        var projetoIntegradorTexto = document.getElementById('projetoIntegradorTexto').value.trim();

        if (projetoIntegradorTexto === '') {
            alert('O campo de texto não pode estar vazio.');
            return;
        }

        localStorage.setItem('projetoIntegradorTexto', projetoIntegradorTexto);
        atualizarEstadoBotoes(true);
    });

    // Evento de clique no botão de editar
    document.getElementById('editBtn').addEventListener('click', function () {
        atualizarEstadoBotoes(false);
    });

    document.getElementById("backBtn").addEventListener('click', function () {
        window.location.href = "pdf.html";
    });
    

    // Evento de clique no botão de gerar PDF
    document.getElementById('generatePdfBtn').addEventListener('click', function () {
        var doc = new jsPDF('landscape');

        // Adicionar a capa
        adicionarImagemAoPDF(doc, 'assets/capa.png', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, function () {
            // Adicionar a página com a introdução
            doc.addPage();
            adicionarImagemAoPDF(doc, 'assets/intro.png', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, function () {
                doc.setFontSize(12);
                var cursoFormatado = formatarTextoParaPDF(formData.curso, 98, 392);
                doc.text(cursoFormatado, 9.5, 69);
                var cargaFormatado = formatarTextoParaPDF(formData.cargaHoraria, 18, 72);
                doc.text(cargaFormatado, 248, 69);
                var eixoFormatado = formatarTextoParaPDF(formData.eixo + " " + "/" + " " + formData.segmento, 71, 209);
                doc.text(eixoFormatado, 9.5, 103);
                var tipoFormatado = formatarTextoParaPDF(formData.tipo, 40, 120);
                doc.text(tipoFormatado, 191, 103);
                var ucFormatado = formatarTextoParaPDF(formData.uc, 90, 450);
                doc.text(ucFormatado, 9.5, 133);
                var chFormatado = formatarTextoParaPDF(formData.ch, 24, 116);
                doc.text(chFormatado, 234, 133);


               
                adicionarSituacaoAoPDF(doc, 0, function() {
                    doc.save('modelo-ptd.pdf');

                    localStorage.removeItem("formData");
                localStorage.removeItem("horasRestantes");
                localStorage.removeItem("todasSituacoes");
                localStorage.removeItem("situacaoAtual");
                localStorage.removeItem('respostasSituacoes');


                window.location.href = "index.html";

                });
            });
        });
    });

    // Carregar o valor do localStorage no input ao carregar a página
    var projetoIntegradorTexto = localStorage.getItem('projetoIntegradorTexto') || '';
    document.getElementById('projetoIntegradorTexto').value = projetoIntegradorTexto;

    autoExpand(textarea);
});