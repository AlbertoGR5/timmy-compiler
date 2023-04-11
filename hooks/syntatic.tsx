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
    aquies: /\baquies\s*\b/,
    definelas: /definelas\s*/,
    Digito: /\bDigito\s+\w+\s*=\s*\d+\b/,
    Letrillas: /\bLetrillas\s+\w+\s*=\s*'[^']*'/,
    value: /'[^']*'|"[^"]*"|\d+/,
    comma: /,/,
    empezando: /\bempezando\s*/,
    print: /\s*print\s*\(\s*(?:[a-zA-Z]\w*\s*\+\s*)*[a-zA-Z]\w*\s*(?:\s*\+\s*(?:\d+|[a-zA-Z]\w*)|\s*,\s*(?:\d+|[a-zA-Z]\w*)\s*)*\)/,
    semicolon: /;/,
    if: /if\s*\(\s*(?:\w+)\s*(?:[<>=!]+)\s*(?:\w+)\s*\)\s*\{(?:[\s\S]*?)\}/,
    for: /for\s*\{(?:[\s\S]*?)\}/,
    aquifue: /\baquifue\s*/,
    // sum: /\b\d+\s*\+\s*\d+\b|\b[a-zA-Z]\w*\s*\+\s*[a-zA-Z]\w*\b/,
    // ident: /(?!(?:aquies|definelas|empezando|print|rpt|aquifue)\b)[a-zA-Z]\w*/,
    digito: /\bdigito\b/,
    letrillas: /\bletrillas\b/,
});

const validatedefinelas = (code: String | undefined, txt: any) => {
    const errordefinelas = [];
    let tokens: any[] = [];
    try {
        lexer.reset(code);
        tokens = Array.from(lexer);
    } catch (error: any) {
        errordefinelas.push(error.message);
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
                errordefinelas.push(e.message);
                break;
            }
        }
    }
    // lexer.reset
    let variables = {} as unknown as any;

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === "Digito" || tokens[i].type === "Letrillas") {
            const varName = tokens[i].value.split(" ")[1];
            const varType = tokens[i].type;
            const varValue = tokens[i].value.split(" ")[3];
            if (variables[varName]) {
                errordefinelas.push(
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
        if (tokens[i].type === "empezando") {
            break;
        }
    }
    return [errordefinelas, variables];
};

interface Variables {
    [key: string]: {
        type: string;
        value: string;
    };
}

const validateempezando = (
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
            tokens[i].type === "Digito" ||
            tokens[i].type === "Letrillas" ||
            tokens[i].type === "value" ||
            tokens[i].type === "plus" ||
            tokens[i].type === "Digito" ||
            tokens[i].type === "letrillas" ||
            tokens[i].type === "aquies" ||
            tokens[i].type === "definelas" ||
            tokens[i].type === "empezando" ||
            tokens[i].type === "aquifue"
        ) {
            continue;
        } else if (tokens[i].type === "print") {
            // ...
            const definelas = tokens[i].value
                .replace(/\s/g, "")
                .match(/\(([^)]+)\)/)[1]
                .split(/[\+\-\*\/,]/g)
                .map((valor: any) => valor.trim());
            const aritmetics = tokens[i].value
                .replace(/\s/g, "")
                .match(/print\(([^,]+),\s*([^)]+)\)/);
            console.log(aritmetics);
            definelas.forEach((varName: any) => {
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
                const operation = aritmetics[2]; // 'Digito + Digito2'
                const variablesUsed = operation
                    .split(/[\+\-\*\/]/g)
                    .map((value: any) => value.trim()); // ['Digito', 'Digito2']

                for (const varName of variablesUsed) {
                    const name = varName.replace(/['"]+/g, "");
                    console.log(variables && variables[name].type);
                    if (
                        variables &&
                        variables[name] &&
                        variables[name].type !== "Digito"
                    ) {
                        errors.push(`Variable ${name} is not of type Digito`);
                        continue;
                    }
                }
            }
        } else if (tokens[i].type === "rpt") {
            // ...
        } else {
            console.log(tokens[i]);
            errors.push(
                findErrorLine(
                    txt,
                    tokens[i].value,
                    "Invalid statement on line: "
                )
            );
            continue;
        }
    }

    return errors;
};

const validateCode = (code: string) => {
    let txt = code.replace(/\r\n/g, "\n");
    const [errordefinelas, variables] = validatedefinelas(code, txt);

    console.log(errordefinelas);

    const empezandoErrors = validateempezando(code, txt, variables);

    const regex = /(aquies[\s\S]*definelas[\s\S]*empezando[\s\S]*aquifue)/;
    const result = txt.match(regex);
    if (result) {
        const aquies = /\baquies\s*\b/.test(result[0]);
        const definelas = /\bdefinelas\s*\b/.test(result[0]);
        const empezando = /\bempezando\s*\b/.test(result[0]);
        const aquifue = /\baquifue\s*\b/.test(result[0]);
        if (!aquies) {
            errordefinelas.push("Missing aquies statement");
        }
        if (!definelas) {
            errordefinelas.push("Missing definelas statement");
        }
        if (!empezando) {
            errordefinelas.push("Missing empezando statement");
        }
        if (!aquifue) {
            errordefinelas.push("Missing aquifue statement");
        }
    } else {
        errordefinelas.push(
            "Missing aquies, definelas, empezando or aquifue statement, remember to use the correct order"
        );
    }

    return errordefinelas.concat(empezandoErrors);
};

export const validate = (code: any) => {
    const errors = validateCode(code);
    if (errors.length === 0) {
        console.log("Syntax validation successful");
        return null;
    } else {
        console.log("Error(s) found:");
        console.log(errors);
        console.log(errors.join("\n"));
        return errors.filter((value: any, index: any) => {
            return errors.indexOf(value) === index;
        });
    }
};
