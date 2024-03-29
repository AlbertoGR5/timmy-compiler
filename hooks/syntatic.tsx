import moo from "moo";

const findErrorLine = (
    txt: {
        indexOf: (arg0: any) => any;
        substr: (
            arg0: number,
            arg1: any
        ) => {
            (): any;
            new (): any;
            split: {
                (arg0: string): { (): any; new (): any; length: any };
                new (): any;
            };
        };
    },
    tokenError: string,
    message: string
) => {
    const errorWord = tokenError.split(" ");
    const positionOfError = txt.indexOf(errorWord[0]);
    const line = txt.substr(0, positionOfError).split("\n").length;
    return `${message}${line}`;
};

const lexer = moo.compile({
    plus: /\+/,
    WS: /[ \t]+/,
    singleLineComment: /\/\/.*/,
    multiLineComment: /\/\*[\s\S]*?\*\//,
    newline: { match: /\n/, lineBreaks: true },
    init: /\binit\s*\b/,
    vars: /vars\s*/,
    Num: /\bNum\s+\w+\s*=\s*\d+\b/,
    String: /\bString\s+\w+\s*=\s*'[^']*'/,
    value: /'[^']*'|"[^"]*"|\d+/,
    comma: /,/,
    body: /\bbody\s*/,
    log: /\s*log\s*\(\s*(?:[a-zA-Z]\w*\s*\+\s*)*[a-zA-Z]\w*\s*(?:\s*\+\s*(?:\d+|[a-zA-Z]\w*)|\s*,\s*(?:\d+|[a-zA-Z]\w*)\s*)*\)/,
    semicolon: /;/,
    if: /if\s*\(\s*(?:\w+)\s*(?:[<>=!]+)\s*(?:\w+)\s*\)\s*\{(?:[\s\S]*?)\}/,
    rpt: /rpt\s*\{(?:[\s\S]*?)\}/,

    end: /\bend\s*/,
    // sum: /\b\d+\s*\+\s*\d+\b|\b[a-zA-Z]\w*\s*\+\s*[a-zA-Z]\w*\b/,
    // ident: /(?!(?:init|vars|body|log|rpt|end)\b)[a-zA-Z]\w*/,
    num: /\bnum\b/,
    str: /\bstr\b/,
});

const validateVars = (code: string | undefined, txt: any) => {
    const errorVars = [];
    let tokens: any[] = [];
    try {
        lexer.reset(code);
        tokens = Array.from(lexer);
    } catch (error: any) {
        errorVars.push(error.message);
        lexer.next();
        lexer.reset(code);
        while (true) {
            try {
                const token = lexer.next();
                if (token === undefined) {
                    break;
                }
                tokens.push(token);
            } catch (e: any) {
                errorVars.push(e.message);
                break;
            }
        }
    }
    // lexer.reset
    let variables = {} as unknown as any;

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === "Num" || tokens[i].type === "String") {
            const varName = tokens[i].value.split(" ")[1];
            const varType = tokens[i].type;
            const varValue = tokens[i].value.split(" ")[3];
            if (variables[varName]) {
                errorVars.push(
                    findErrorLine(
                        txt,
                        varName,
                        "Variable already defined on line: "
                    )
                );
                continue;
            }
            variables[varName] = {
                type: varType,
                value: varValue,
            };
        }
        if (tokens[i].type === "body") {
            break;
        }
    }
    return [errorVars, variables];
};

interface Variables {
    [key: string]: {
        type: string;
        value: string;
    };
}

const validateBody = (
    code: string | undefined,
    txt: any,
    variables: Variables | null
) => {
    let errors = [];
    let tokens: any[] = [];
    try {
        lexer.reset(code);
        tokens = Array.from(lexer);
    } catch (error: any) {
        errors.push(error.message);
        lexer.next();
        lexer.reset(code);
        while (true) {
            try {
                const token = lexer.next();
                if (token === undefined) {
                    break;
                }
                tokens.push(token);
            } catch (e: any) {
                errors.push(e.message);
                break;
            }
        }
    }
    console.log(tokens);
    console.log("variables", variables);
    for (let i = 0; i < tokens.length; i++) {
        if (
            tokens[i].type === "WS" ||
            tokens[i].type === "singleLineComment" ||
            tokens[i].type === "multiLineComment" ||
            tokens[i].type === "newline" ||
            tokens[i].type === "comma" ||
            tokens[i].type === "semicolon" ||
            tokens[i].type === "Num" ||
            tokens[i].type === "String" ||
            tokens[i].type === "value" ||
            tokens[i].type === "plus" ||
            tokens[i].type === "num" ||
            tokens[i].type === "str" ||
            tokens[i].type === "init" ||
            tokens[i].type === "vars" ||
            tokens[i].type === "body" ||
            tokens[i].type === "end" ||
            tokens[i].type === "rpt" ||
            tokens[i].type === "if"
        ) {
            continue;
        } else if (tokens[i].type === "log") {
            // ...
            const vars = tokens[i].value
                .replace(/\s/g, "")
                .match(/\(([^)]+)\)/)[1]
                .split(/[\+\-\*\/,]/g)
                .map((valor: any) => valor.trim());
            const aritmetics = tokens[i].value
                .replace(/\s/g, "")
                .match(/log\(([^,]+),\s*([^)]+)\)/);
            console.log(aritmetics);
            vars.forEach((varName: any) => {
                const name = varName.replace(/['"]+/g, "");
                if (variables && !variables[name]) {
                    errors.push(
                        findErrorLine(
                            txt,
                            varName,
                            "Undefined variable used on line: "
                        )
                    );
                }
            });
            if (aritmetics) {
                const variable = aritmetics[1]; // 'txt2'
                const operation = aritmetics[2]; // 'num + num2'
                const variablesUsed = operation
                    .split(/[\+\-\*\/]/g)
                    .map((value: any) => value.trim()); // ['num', 'num2']

                for (const varName of variablesUsed) {
                    const name = varName.replace(/['"]+/g, "");
                    if (
                        variables &&
                        variables[name] &&
                        variables[name].type !== "Num"
                    ) {
                        errors.push(`Variable ${name} is not of type Num`);
                        continue;
                    }
                }
            }
        } else if (tokens[i].type === "rpt") {
            // ...
            console.log(tokens[i]);
        } else if (tokens[i].type === "if") {
            console.log(tokens[i]);
        } else {
            console.log(tokens[i]);
            errors.push(
                findErrorLine(
                    txt,
                    tokens[i].value,
                    "Invalid declaracion on line: "
                )
            );
            continue;
        }
    }

    return errors;
};

const validateCode = (code: string) => {
    let txt = code.replace(/\r\n/g, "\n");
    const [errorVars, variables] = validateVars(code, txt);

    console.log(errorVars);

    const bodyErrors = validateBody(code, txt, variables);

    const regex = /(init[\s\S]*vars[\s\S]*body[\s\S]*end)/;
    const result = txt.match(regex);
    if (result) {
        const init = /\binit\s*\b/.test(result[0]);
        const vars = /\bvars\s*\b/.test(result[0]);
        const body = /\bbody\s*\b/.test(result[0]);
        const end = /\bend\s*\b/.test(result[0]);
        if (!init) {
            errorVars.push("Falta init declaracion");
        }
        if (!vars) {
            errorVars.push("Falta vars declaracion");
        }
        if (!body) {
            errorVars.push("Falta body declaracion");
        }
        if (!end) {
            errorVars.push("Falta end declaracion");
        }
    } else {
        errorVars.push(
            "Falta init, vars, body o end declaracion, recuerda usar el orden correcto"
        );
    }

    return errorVars.concat(bodyErrors);
};

export const validate = (code: any) => {
    const errors = validateCode(code);
    if (errors.length === 0) {
        console.log("Syntax validation successful");
        return null;
    } else {
        console.log(errors);
        console.log(errors.join("\n"));
        return errors.filter((value: any, index: any) => {
            return errors.indexOf(value) === index;
        });
    }
};