document.addEventListener('DOMContentLoaded', function () {
    var formData = JSON.parse(localStorage.getItem("formData"));
    // var situacoesAprendizagem = parseInt(formData.situAprendizagem);
    var totalCargaHoraria = parseInt(formData.cargaHoraria);
    var cargaHorariaAula = parseInt(formData.situAprendizagem);
    var situacaoAtual = parseInt(localStorage.getItem("situacaoAtual"), 10);
    var todasSituacoes = JSON.parse(localStorage.getItem("todasSituacoes")) || [];
    var situacaoData = todasSituacoes[situacaoAtual - 1];
    var cargaHorariaSituacao = parseInt(situacaoData.quantidadeAulas);
    var totalAulas = Math.ceil(cargaHorariaSituacao/cargaHorariaAula);
    var horasRestantes = parseInt(localStorage.getItem("horasRestantes")) || 0;
    var accordionContainer = document.getElementById('accordionContainer');
    var respostasSituacoes = JSON.parse(localStorage.getItem('respostasSituacoes')) || {};
    var respostas = {};

    if (isNaN(horasRestantes)) {
        horasRestantes = totalCargaHoraria;
        localStorage.setItem("horasRestantes", horasRestantes.toString());
    }


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

    var horasRestantesDiv = document.createElement('div');
    horasRestantesDiv.className = 'horas-restantes-info';
    horasRestantesDiv.style.marginBottom = '20px';
    horasRestantesDiv.style.padding = '10px';
    horasRestantesDiv.style.backgroundColor = '#f0f0f0';
    horasRestantesDiv.style.borderRadius = '5px';
    horasRestantesDiv.style.textAlign = 'center';
    horasRestantesDiv.innerHTML = `<strong>Horas restantes do curso:</strong> ${horasRestantes}h`;
    
    accordionContainer.parentNode.insertBefore(horasRestantesDiv, accordionContainer);

    function criarAccordion() {
        var accordionHTML = '';

        for (var i = 1; i <= totalAulas; i++) {
            accordionHTML += `
            <div class="accordion-item">
    <input type="checkbox" id="accordion-${i}">
    <label for="accordion-${i}">Aula ${i}</label>
    <div class="accordion-content">
        <div class="row">
            <div class="form-group full-width">
                <div class="label-container">
                    <div class="tooltip">
                        <img src="assets/info.png" alt="Informação" class="info-icon">
                        <span class="tooltip-text">Descreva as atividades que serão desenvolvidas em cada aula, com base na situação de aprendizagem e considerando o ciclo ação x reflexão x ação.</span>
                    </div>
                    <label for="atividades-${i}" id="atividadesTitle">Atividades:</label>
                </div>
                <textarea id="atividades-${i}" name="atividades-${i}" placeholder="Digite aqui as atividades..." required></textarea>
            </div>
        </div>
        <div class="row">
            <div class="form-group full-width">
                <div class="label-container">
                    <div class="tooltip">
                        <img src="assets/info.png" alt="Informação" class="info-icon">
                        <span class="tooltip-text">Indique os Objetos Digitais de Aprendizagem (ODAs) e/ou as estratégias metodológicas que serão utilizadas nas atividades descritas.</span>
                    </div>
                    <label for="odas-${i}" id="odasTitle">ODAs e/ou estratégias metodológicas:</label>
                </div>
                <textarea id="odas-${i}" name="odas-${i}" placeholder="Digite aqui as ODAs..." required></textarea>
            </div>
        </div>
        <div class="row">
            <div class="form-group full-width">
                <div class="label-container">
                    <div class="tooltip">
                        <img src="assets/info.png" alt="Informação" class="info-icon">
                        <span class="tooltip-text">Descreva os procedimentos e os instrumentos de avaliação que serão utilizados para mensurar o desenvolvimento da competência</span>
                    </div>
                    <label for="procedimentos-${i}" id="procedimentosTitle">Procedimentos e instrumentos de avaliação:</label>
                </div>
                <textarea id="procedimentos-${i}" name="procedimentos-${i}" placeholder="Digite aqui os procedimentos de avaliação..." required></textarea>
            </div>
        </div>
        <button type="button" class="save-button" data-aula="${i}">Salvar Aula</button>
        <button type="button" class="edit-button" data-aula="${i}" style="display:none;">Editar Aula</button>
    </div>
</div>`;
        }

        accordionContainer.innerHTML = accordionHTML;
    }

    criarAccordion();

    function verificarPreenchimento() {
        var todasPreenchidas = Object.keys(respostas).length === totalAulas;
        document.getElementById('nextPageBtn').disabled = !todasPreenchidas;
    }

    function salvarDadosAula(aula) {
        var atividades = document.getElementById(`atividades-${aula}`).value.trim();
        var odas = document.getElementById(`odas-${aula}`).value.trim();
        var procedimentos = document.getElementById(`procedimentos-${aula}`).value.trim();

        if (atividades && odas && procedimentos) {
            respostas[aula] = { 
                atividades: formatarTextoParaPDF(atividades, 89, 1957), 
                odas: formatarTextoParaPDF(odas, 19, 381),
                procedimentos: formatarTextoParaPDF(procedimentos, 113, 678) 
            };

            document.querySelector(`.save-button[data-aula="${aula}"]`).style.display = 'none';
            document.querySelector(`.edit-button[data-aula="${aula}"]`).style.display = 'inline-block';

            verificarPreenchimento();
        } else {
            alert("Por favor, preencha todos os campos antes de salvar.");
        }
    }

    criarAccordion();

    accordionContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('save-button')) {
            var aula = event.target.getAttribute('data-aula');
            salvarDadosAula(aula);
        } else if (event.target.classList.contains('edit-button')) {
            var aula = event.target.getAttribute('data-aula');
            document.querySelector(`#accordion-${aula}`).checked = false;
            event.target.style.display = 'none';
            document.querySelector(`.save-button[data-aula="${aula}"]`).style.display = 'inline-block';
        }
    });

    document.getElementById('backPageBtn').addEventListener('click', function () {
        window.location.href = "situacao.html";
    });

    document.getElementById('nextPageBtn').addEventListener('click', function () {
        var todasPreenchidas = Object.keys(respostas).length === totalAulas;
        if (todasPreenchidas) {
            // Salva as respostas da situação atual
         
            
            localStorage.setItem('respostasSituacoes', JSON.stringify(respostasSituacoes));
    
            // Atualiza situação atual e verifica navegação
            situacaoAtual++;
            localStorage.setItem("situacaoAtual", situacaoAtual.toString());
    
            console.log("Debug - Antes da navegação:");
            console.log("Horas restantes:", horasRestantes);
            console.log("Nova situação atual:", situacaoAtual);
    
            // Verifica se ainda existem horas restantes
            if (horasRestantes > 0) {
                console.log("Redirecionando para situacao.html");
                window.location.href = "situacao.html";
            } else {
                console.log("Redirecionando para gerar.html");
                window.location.href = "gerar.html";
            }
        } else {
            alert("Por favor, preencha todos os campos das aulas antes de avançar.");
        }
    });
    
    verificarPreenchimento();
});