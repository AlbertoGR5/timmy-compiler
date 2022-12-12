import { supportedCharacters } from "./tokens";
import { mErrors } from "./messages";
import { IErrors } from "../interfaces/messages";
export const analize = (text: string) => {
    const paramethers = new RegExp(/\(([^\(\)]*)\)/gm); //parametros

    const strings = new RegExp(/"([^"]*)"|'([^']*)'|`([^`]*)`/gm);
    const numbers = new RegExp(/\d+/gm);
    const booleans = new RegExp(/[^\'\"\`](true|false)/gm);
    const variables = new RegExp(/def\s+[a-zA-z]\w*/gm);
    const asignation = new RegExp(/def\s+[a-zA-z]\w*\s*(=)/gm);


    const simpleComments = new RegExp(/\/{2}.*/gm);
    const multiLineComments = new RegExp(/\/\*[\s\S]*\*\//gm);
    const lineBreak = new RegExp(/\n/gm);

    const multipleSpaces = new RegExp(/\s{2,}/gm);

    const errors: IErrors[] = [];
    const warnings: any = [];
    const info = [];
    //
    const textProcessed = text.replace(multiLineComments, '') // remove multiline comments
        .replace(simpleComments, '') // remove simple comments
        .replace(multipleSpaces, ' ') // remove multiple spaces
        .replace(/\;\s{1}/gm, ';') // remove space before semicolon
        .replace(/^\s+/gm, '') // remove spaces at the beginning of the line


    console.log(textProcessed);

    const lexico = textProcessed.replace(supportedCharacters, '');
    lexico.split('').forEach((char, index) => {
        const line = text.slice(0, text.indexOf(char, index)).split(lineBreak)?.length;
        const column = text.slice(0, text.indexOf(char, index)).split(lineBreak)?.pop()?.length;
        errors.push({ ...mErrors.suportedCharacters, error: char, line, column });
    });

    const startProgram = text.search('inicioProcess');
    const endProgram = text.search('finProcess');
    const starDef = text.search('definicion');
    const endDef = text.search('finDefinicion');
    const startBody = text.search('comienzoBody');

    if (startProgram === -1) errors.push({ ...mErrors.startProgram });
    else {
        const line = text.slice(0, startProgram).split(lineBreak)?.length;
        const column = text.slice(0, startProgram).split(lineBreak)?.pop()?.length;
        if (startProgram > endProgram && endProgram !== -1) errors.push({ ...mErrors.endProgram, error: 'inicioProcess', message: `is before "endExec" and is required at the end of the program`, description: 'endExec is before startExec', line, column });
        if (startProgram > starDef && starDef !== -1) errors.push({ ...mErrors.startDef, error: 'inicioProcess', message: `is before "startDef" and is required after starting program "startExec"`, description: 'startDef is before startExec', line, column });
        if (startProgram > endDef && endDef !== -1) errors.push({ ...mErrors.endDef, error: 'inicioProcess', message: `is before "endDef" and is required at the end of the variable area`, description: 'endDef is before startExec', line, column });
        if (startProgram > startBody && startBody !== -1) errors.push({ ...mErrors.startBody, error: 'inicioProcess', message: `is before "startBody" and is required at the start of the code zone`, description: 'startBody is before startExec', line, column });
    };
    if (starDef === -1) errors.push({ ...mErrors.startDef });
    else {
        const line = text.slice(0, starDef).split(lineBreak)?.length;
        const column = text.slice(0, starDef).split(lineBreak)?.pop()?.length;
        if (starDef < startProgram && startProgram !== -1) errors.push({ ...mErrors.startProgram, error: 'definicion', message: `is after "startExec" and is required at the start of the program`, description: 'startExec is after startDef', line, column });
        if (starDef > endDef && endDef !== -1) errors.push({ ...mErrors.endDef, error: 'definicion', message: `is before "endDef" and is required at the end of the variable area`, description: 'endDef is before startDef', line, column });
        if (starDef > startBody && startBody !== -1) errors.push({ ...mErrors.startBody, error: 'definicion', message: `is before "startBody" and is required at the start of the code zone`, description: 'startBody is before startDef', line, column });
        if (starDef > endProgram && endProgram !== -1) errors.push({ ...mErrors.endProgram, error: 'definicion', message: `is before "endExec" and is required at the end of the program`, description: 'endExec is before startDef', line, column });
    };
    if (endDef === -1) errors.push({ ...mErrors.endDef });
    else {
        const line = text.slice(0, endDef).split(lineBreak)?.length;
        const column = text.slice(0, endDef).split(lineBreak)?.pop()?.length;
        if (endDef < startProgram && endDef !== -1) errors.push({ ...mErrors.startProgram, error: 'finDefinicion', message: `is after "startExec" and is required at the start of the program`, description: 'startExec is after endDef', line, column });
        if (endDef < starDef && starDef !== -1) errors.push({ ...mErrors.startDef, error: 'finDefinicion', message: `is after "startDef" and is required after starting program "startExec"`, description: 'startDef is after endDef', line, column });
        if (endDef > startBody && startBody !== -1) errors.push({ ...mErrors.startBody, error: 'finDefinicion', message: `is before "startBody" and is required at the start of the code zone`, description: 'startBody is before endDef', line, column });
        if (endDef > endProgram && endProgram !== -1) errors.push({ ...mErrors.endProgram, error: 'finDefinicion', message: `is before "endExec" and is required at the end of the program`, description: 'endExec is before endDef', line, column });
    };
    if (startBody === -1) errors.push({ ...mErrors.startBody });
    else {
        const line = text.slice(0, startBody).split(lineBreak)?.length;
        const column = text.slice(0, startBody).split(lineBreak)?.pop()?.length;
        if (startBody < startProgram && startProgram !== -1) errors.push({ ...mErrors.startProgram, error: 'comienzoBody', message: `is after "startExec" and is required at the start of the program`, description: 'startExec is after startBody', line, column });
        if (startBody < starDef && starDef !== -1) errors.push({ ...mErrors.startDef, error: 'comienzoBody', message: `is after "startDef" and is required after starting program "startExec"`, description: 'startDef is after startBody', line, column });
        if (startBody < endDef && endDef !== -1) errors.push({ ...mErrors.endDef, error: 'comienzoBody', message: `is after "endDef" and is required at the end of the variable area`, description: 'endDef is after startBody', line, column });
        if (startBody > endProgram && endProgram !== -1) errors.push({ ...mErrors.endProgram, error: 'comienzoBody', message: `is before "endExec" and is required at the end of the program`, description: 'endExec is before startBody', line, column });
    };
    if (endProgram === -1) errors.push({ ...mErrors.endProgram });
    else {
        const line = text.slice(0, endProgram).split(lineBreak)?.length;
        const column = text.slice(0, endProgram).split(lineBreak)?.pop()?.length;
        if (endProgram < startProgram && startProgram !== -1) errors.push({ ...mErrors.startProgram, error: 'finProcess', message: `is after "startExec" and is required at the start of the program`, description: 'startExec is after endExec', line, column });
        if (endProgram < starDef && starDef !== -1) errors.push({ ...mErrors.startDef, error: 'finProcess', message: `is after "startDef" and is required after starting program "startExec"`, description: 'startDef is after endExec', line, column });
        if (endProgram < endDef && endDef !== -1) errors.push({ ...mErrors.endDef, error: 'finProcess', message: `is after "endDef" and is required at the end of the variable area`, description: 'endDef is after endExec', line, column });
        if (endProgram < startBody && startBody !== -1) errors.push({ ...mErrors.startBody, error: 'finProcess', message: `is after "startBody" and is required at the start of the code zone`, description: 'startBody is after endExec', line, column });
    };
    
    return {
        errors: errors,
        warnings: warnings,
        textProcessed: textProcessed,
    }
};