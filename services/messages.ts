import { IErrors } from "../interfaces/messages"
export const mErrors: any = {
    suportedCharacters: { error: '', message: `El caracter no es valido`, description: 'Caracteres validos: a-z, A-Z, 0-9, (, ), {, }, [, ], ., ,, ;, :, +, -, *, /, =, >, <, !, &, |, ?, `, ", %, $', line: 0, column: 0 },
    startProgram: { error: 'inicioProcess', message: `se requiere el inicio del programa`, description: 'inicioProcesstartExec is missing', line: '?', column: '?' },
    startDef: { error: 'definicion', message: `se requiere inicio de la zona de variables`, description: 'startDef is missing', line: '?', column: '?' },
    endDef: { error: 'finDefinicion', message: `se requiere fin de la zona de variables`, description: 'endDef is missing', line: '?', column: '?' },
    startBody: { error: 'comienzoBody', message: `se requiere inicio del codigo`, description: 'startBody is missing', line: '?', column: '?' },
    endProgram: { error: 'finProcess', message: `se requiere el fin del programa`, description: 'endExec is missing', line: '?', column: '?' },
}