// =====================================================
// CODEVIZ - MAIN JAVASCRIPT
// =====================================================


// =====================================================
// EDITOR PAGE
// =====================================================

const languageSelect =
    document.getElementById("language");

const fileName =
    document.getElementById("fileName");

const codeInput =
    document.getElementById("codeInput");

const runButton =
    document.getElementById("runButton");


// -----------------------------------------------------
// Language Selector
// -----------------------------------------------------

if (languageSelect) {

    languageSelect.addEventListener(
        "change",
        function () {

            const language = this.value;

            if (language === "cpp") {
                fileName.innerText = "main.cpp";
            }

            else if (language === "c") {
                fileName.innerText = "main.c";
            }

            else if (language === "java") {
                fileName.innerText = "Main.java";
            }

            else if (language === "python") {
                fileName.innerText = "main.py";
            }

        }
    );

}


// =====================================================
// RUN CODE
// =====================================================

if (runButton) {

    runButton.addEventListener(
        "click",
        function () {

            const code =
                codeInput.value;

            const language =
                languageSelect.value;


            if (code.trim() === "") {

                alert(
                    "Please write some code first."
                );

                return;
            }


            // Save code

            localStorage.setItem(
                "codeVizCode",
                code
            );


            // Save language

            localStorage.setItem(
                "codeVizLanguage",
                language
            );


            // Open Visualizer

            window.location.href =
                "visualizer.html";

        }
    );

}


// =====================================================
// VISUALIZER ELEMENTS
// =====================================================

const codeDisplay =
    document.getElementById("codeDisplay");

const variablesPanel =
    document.getElementById("variablesPanel");

const memoryPanel =
    document.getElementById("memoryPanel");

const outputPanel =
    document.getElementById("outputPanel");

const nextButton =
    document.getElementById("nextButton");

const previousButton =
    document.getElementById(
        "previousButton"
    );

const resetButton =
    document.getElementById(
        "resetButton"
    );

const currentLanguage =
    document.getElementById(
        "currentLanguage"
    );

const executionStatus =
    document.getElementById(
        "executionStatus"
    );


// =====================================================
// VISUALIZER VARIABLES
// =====================================================

let lines = [];

let currentLine = 0;

let variables = {};

let history = [];


// =====================================================
// LOAD SAVED CODE
// =====================================================

if (codeDisplay) {

    const savedCode =
        localStorage.getItem(
            "codeVizCode"
        );

    const savedLanguage =
        localStorage.getItem(
            "codeVizLanguage"
        );


    if (!savedCode) {

        codeDisplay.innerHTML =
            `<p class="empty-message">
                No code found.
                Go to Code Editor first.
            </p>`;

    }

    else {

        lines =
            savedCode.split("\n");


        // Set language

        if (savedLanguage === "cpp") {
            currentLanguage.innerText = "C++";
        }

        else if (savedLanguage === "c") {
            currentLanguage.innerText = "C";
        }

        else if (savedLanguage === "java") {
            currentLanguage.innerText = "Java";
        }

        else if (savedLanguage === "python") {
            currentLanguage.innerText = "Python";
        }


        displayCode();

    }

}


// =====================================================
// DISPLAY CODE
// =====================================================

function displayCode() {

    codeDisplay.innerHTML = "";


    lines.forEach(
        function (line, index) {

            const lineElement =
                document.createElement(
                    "div"
                );


            lineElement.className =
                "code-line-visual";


            lineElement.id =
                "visual-line-" + index;


            const number =
                document.createElement(
                    "span"
                );

            number.className =
                "code-line-number";

            number.innerText =
                index + 1;


            const text =
                document.createElement(
                    "span"
                );

            text.innerText =
                line;


            lineElement.appendChild(
                number
            );

            lineElement.appendChild(
                text
            );


            codeDisplay.appendChild(
                lineElement
            );

        }
    );

}


// =====================================================
// NEXT STEP
// =====================================================

if (nextButton) {

    nextButton.addEventListener(
        "click",
        function () {

            executeNextStep();

        }
    );

}


// =====================================================
// EXECUTE NEXT STEP
// =====================================================

function executeNextStep() {

    // Skip empty lines

    while (
        currentLine < lines.length &&
        lines[currentLine].trim() === ""
    ) {

        currentLine++;

    }


    // Program finished

    if (
        currentLine >= lines.length
    ) {

        executionStatus.innerText =
            "● Finished";

        executionStatus.style.color =
            "#22c55e";


        outputPanel.innerHTML +=
            `<div>
                <span class="console-symbol">
                    &gt;
                </span>
                Program execution finished.
            </div>`;


        return;

    }


    // Save current state

    history.push({

        line: currentLine,

        variables: {
            ...variables
        }

    });


    // Remove old highlight

    document
        .querySelectorAll(
            ".code-line-visual"
        )
        .forEach(
            function (line) {

                line.classList.remove(
                    "active"
                );

            }
        );


    // Highlight current line

    const activeLine =
        document.getElementById(
            "visual-line-" +
            currentLine
        );


    if (activeLine) {

        activeLine.classList.add(
            "active"
        );

    }


    const line =
        lines[currentLine].trim();


    executionStatus.innerText =
        "● Executing Line " +
        (currentLine + 1);

    executionStatus.style.color =
        "#38bdf8";


    // =================================================
    // IF CONDITION
    // =================================================

    if (
        line.match(
            /^if\s*\((.*)\)\s*\{?$/
        )
    ) {

        handleIfCondition(line);

        return;

    }


    // =================================================
    // ELSE
    // =================================================

    if (
        line === "else" ||
        line === "else {"
    ) {

        showElseMessage();

        currentLine++;

        return;

    }


    // =================================================
    // VARIABLE
    // =================================================

    analyzeVariable(line);


    // =================================================
    // OUTPUT
    // =================================================

    analyzeOutput(line);


    // =================================================
    // NORMAL LINE
    // =================================================

    currentLine++;

}


// =====================================================
// IF CONDITION
// =====================================================

function handleIfCondition(line) {

    const match =
        line.match(
            /^if\s*\((.*)\)\s*\{?$/
        );


    if (!match) {

        currentLine++;

        return;

    }


    const condition =
        match[1];


    const result =
        evaluateCondition(
            condition
        );


    // Show condition result

    showCondition(
        condition,
        result
    );


    // =================================================
    // CONDITION TRUE
    // =================================================

    if (result) {

        currentLine++;

        return;

    }


    // =================================================
    // CONDITION FALSE
    // =================================================

    skipIfBlock();

}


// =====================================================
// EVALUATE CONDITION
// =====================================================

function evaluateCondition(
    condition
) {

    try {

        let expression =
            condition;


        expression =
            expression.replace(
                /\b[a-zA-Z_]\w*\b/g,
                function (name) {

                    if (
                        variables[name]
                        !== undefined
                    ) {

                        return variables[name];

                    }

                    return name;

                }
            );


        return Boolean(
            eval(expression)
        );

    }

    catch {

        return false;

    }

}


// =====================================================
// SHOW CONDITION
// =====================================================

function showCondition(
    condition,
    result
) {

    const existing =
        document.getElementById(
            "condition-message"
        );


    if (existing) {

        existing.remove();

    }


    const box =
        document.createElement(
            "div"
        );


    box.id =
        "condition-message";


    box.style.margin =
        "15px";

    box.style.padding =
        "14px";

    box.style.borderRadius =
        "8px";

    box.style.fontFamily =
        "Consolas, monospace";

    box.style.background =
        result
            ? "#052e16"
            : "#450a0a";

    box.style.border =
        result
            ? "1px solid #22c55e"
            : "1px solid #ef4444";

    box.style.color =
        result
            ? "#4ade80"
            : "#f87171";


    box.innerHTML = `

        <strong>
            Condition
        </strong>

        <br><br>

        ${condition}

        →

        <strong>
            ${result ? "TRUE ✓" : "FALSE ✗"}
        </strong>

    `;


    outputPanel.appendChild(
        box
    );

}


// =====================================================
// SKIP IF BLOCK
// =====================================================

function skipIfBlock() {

    let braceCount = 0;

    let started =
        false;


    currentLine++;


    while (
        currentLine < lines.length
    ) {

        const line =
            lines[currentLine].trim();


        // Opening brace

        if (
            line.includes("{")
        ) {

            braceCount++;

            started = true;

        }


        // Closing brace

        if (
            line.includes("}")
        ) {

            braceCount--;


            if (
                started &&
                braceCount <= 0
            ) {

                break;

            }

        }


        currentLine++;

    }


    // Move to ELSE

    if (
        currentLine + 1 <
        lines.length
    ) {

        const nextLine =
            lines[currentLine + 1]
                .trim();


        if (
            nextLine === "else" ||
            nextLine === "else {"
        ) {

            currentLine++;

            return;

        }

    }


    currentLine++;

}


// =====================================================
// ELSE MESSAGE
// =====================================================

function showElseMessage() {

    const box =
        document.createElement(
            "div"
        );


    box.style.margin =
        "15px";

    box.style.padding =
        "14px";

    box.style.borderRadius =
        "8px";

    box.style.background =
        "#172554";

    box.style.border =
        "1px solid #3b82f6";

    box.style.color =
        "#60a5fa";


    box.innerHTML = `

        <strong>
            ELSE Block Executed
        </strong>

        <br>

        The IF condition was FALSE.

    `;


    outputPanel.appendChild(
        box
    );

}


// =====================================================
// VARIABLE ANALYSIS
// =====================================================

function analyzeVariable(
    line
) {

    // Declaration

    const declaration =
        line.match(
            /(?:int|float|double|string)\s+(\w+)\s*=\s*(.+);/
        );


    if (declaration) {

        const variableName =
            declaration[1];

        const expression =
            declaration[2];


        const value =
            evaluateExpression(
                expression
            );


        variables[variableName] =
            value;


        updateVariables();


        return;

    }


    // Assignment

    const assignment =
        line.match(
            /^(\w+)\s*=\s*(.+);$/
        );


    if (assignment) {

        const variableName =
            assignment[1];

        const expression =
            assignment[2];


        if (
            variables[variableName]
            !== undefined
        ) {

            variables[variableName] =
                evaluateExpression(
                    expression
                );


            updateVariables();

        }

    }

}


// =====================================================
// UPDATE VARIABLES
// =====================================================

function updateVariables() {

    variablesPanel.innerHTML = "";

    memoryPanel.innerHTML = "";


    for (
        const name in variables
    ) {

        // Variable

        const variable =
            document.createElement(
                "div"
            );


        variable.className =
            "variable-item";


        variable.innerHTML = `

            <span class="variable-name">
                ${name}
            </span>

            <span class="variable-value">
                ${variables[name]}
            </span>

        `;


        variablesPanel.appendChild(
            variable
        );


        // Memory

        const memory =
            document.createElement(
                "div"
            );


        memory.className =
            "memory-box";


        memory.innerHTML = `

            <span class="memory-name">
                ${name}
            </span>

            <span class="memory-value">
                ${variables[name]}
            </span>

        `;


        memoryPanel.appendChild(
            memory
        );

    }


    if (
        Object.keys(variables)
            .length === 0
    ) {

        variablesPanel.innerHTML =
            `<p class="empty-message">
                No variables yet.
            </p>`;


        memoryPanel.innerHTML =
            `<p class="empty-message">
                Memory will appear here.
            </p>`;

    }

}


// =====================================================
// OUTPUT ANALYSIS
// =====================================================

function analyzeOutput(
    line
) {

    let output = null;


    // C++

    if (
        line.includes("cout")
    ) {

        const match =
            line.match(
                /cout\s*<<\s*(.+);/
            );


        if (match) {

            output =
                evaluateExpression(
                    match[1]
                );

        }

    }


    // Java

    else if (
        line.includes(
            "System.out.println"
        )
    ) {

        const match =
            line.match(
                /System\.out\.println\((.+)\)/
            );


        if (match) {

            output =
                evaluateExpression(
                    match[1]
                );

        }

    }


    // Python

    else if (
        line.startsWith("print")
    ) {

        const match =
            line.match(
                /print\((.+)\)/
            );


        if (match) {

            output =
                evaluateExpression(
                    match[1]
                );

        }

    }


    if (
        output !== null
    ) {

        outputPanel.innerHTML += `

            <div>

                <span class="console-symbol">
                    &gt;
                </span>

                ${output}

            </div>

        `;

    }

}


// =====================================================
// EXPRESSION EVALUATION
// =====================================================

function evaluateExpression(
    expression
) {

    expression =
        expression.trim();


    // Remove semicolon

    expression =
        expression.replace(
            /;$/,
            ""
        );


    // String

    if (
        (
            expression.startsWith('"') &&
            expression.endsWith('"')
        )
        ||
        (
            expression.startsWith("'") &&
            expression.endsWith("'")
        )
    ) {

        return expression.slice(
            1,
            -1
        );

    }


    try {

        const converted =
            expression.replace(
                /\b[a-zA-Z_]\w*\b/g,
                function (name) {

                    if (
                        variables[name]
                        !== undefined
                    ) {

                        return variables[name];

                    }

                    return name;

                }
            );


        return eval(converted);

    }

    catch {

        return expression;

    }

}


// =====================================================
// PREVIOUS
// =====================================================

if (previousButton) {

    previousButton.addEventListener(
        "click",
        function () {

            if (
                history.length === 0
            ) {

                return;

            }


            const previousState =
                history.pop();


            currentLine =
                previousState.line;


            variables =
                {
                    ...previousState.variables
                };


            displayCode();


            updateVariables();


            outputPanel.innerHTML =
                `<div>

                    <span class="console-symbol">
                        &gt;
                    </span>

                    Previous step restored.

                </div>`;


            executionStatus.innerText =
                "● Ready";

            executionStatus.style.color =
                "#22c55e";

        }
    );

}


// =====================================================
// RESET
// =====================================================

if (resetButton) {

    resetButton.addEventListener(
        "click",
        function () {

            currentLine = 0;

            variables = {};

            history = [];


            displayCode();

            updateVariables();


            outputPanel.innerHTML =
                `<div>

                    <span class="console-symbol">
                        &gt;
                    </span>

                    Program reset.

                </div>`;


            executionStatus.innerText =
                "● Ready";

            executionStatus.style.color =
                "#22c55e";

        }
    );

}