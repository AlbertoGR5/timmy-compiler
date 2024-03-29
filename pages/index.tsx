/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TextEditor } from "../components/TextEditor";
import styles from "../styles/Home.module.css";

import play from "../public/images/compilar.png";
import stop from "../public/images/parar.png";
import terminal from "../public/images/terminal.png";
import plus from "../public/images/agregar.png";
import crear from "../public/images/nuevoarchivo.png";
import headerv from "../public/images/compilador.png";
import { IErrors, IWarnings } from "../interfaces/messages";

import { validate } from "../hooks/syntatic";
import React from "react";

interface IFile {
    name: string;
    text: string;
}
interface IResults {
    errors: IErrors[];
    warnings: IWarnings[];
    textProcessed: string;
}



export default function Home() {
    const [folder, setFolder] = useState("Analizador-Lexico");
    const [linea, setLinea] = useState(0);
    const [columna, setColumna] = useState(0);

    const [errors, setErrors] = useState<any[]>([]);

    const [colapseOpens, setColapseOpens] = useState(">");
    const [colapseFolders, setColapseFolders] = useState(">");

    const [selectedFile, setSelectedFile] = useState<any | null>(0);
    const [showTerminal, setShowTerminal] = useState(false);

    const [saveFiles, setSaveFiles] = useState<any>([]);

    const [files, setFiles] = useState<IFile[]>([]);

    const compiler = (text: string) => {
        text = text.replace(/\r\n/g, "\n");
        console.log(text);
        const syntactic = validate(text);
        const listOfErrors = syntactic;
        setErrors(listOfErrors);
    };

    const [inputChangeName, setInputChangeName] = useState<boolean[]>();

    const handleColapseList = (check: any, set: any) => {
        if (check == ">") {
            set("v");
        } else {
            set(">");
        }
    };

    const handleShowTerminal = () => {
        showTerminal ? setShowTerminal(false) : setShowTerminal(true);
    };

    const handleFileInput = (e: any) => {
        var files = e.target.files;
        var filesArr = Array.prototype.slice.call(files);
        setSaveFiles([...filesArr]);
    };

    const changeCode = (index: number) => {
        if (index === selectedFile)
            setInputChangeName(
                inputChangeName?.map((item, i) => {
                    if (i === index) return true;
                    else return false;
                })
            );
        else setSelectedFile(index);
    };

    const newFile = () => {
        setFiles([...files, { name: "newFile.txt", text: "" }]);
        setSelectedFile(files.length);
    };

    const handleChangeName = (e: any, index: number) => {
        e.preventDefault();
        const newFiles = files.map((item, i) => {
            if (i === index) {
                item.name = e.target[0].value;
                return item;
            } else return item;
        });
        setFiles(newFiles);
    };

    const handleAnalizeCode = () => {
        if (files[selectedFile]) {
            setShowTerminal(true);
            compiler(files[selectedFile].text);
        }
    };

    useEffect(() => {
        (async () => {
            if (saveFiles[0]) {
                const check = new Set();
                files.forEach((file) => {
                    check.add(file.name);
                });
                if (check.has(saveFiles[0].name)) {
                } else {
                    const text = await saveFiles[0].text();
                    setSelectedFile(files.length);
                    setFiles([
                        ...files,
                        { name: saveFiles[0].name, text: text },
                    ]);
                }
            }
        })();
    }, [saveFiles]);

    useEffect(() => {
        const status: boolean[] = [];
        files.forEach((file) => status.push(false));
        setInputChangeName(status);
    }, [files, setFiles]);

    return (
        <div className={styles.container}>
            <Head>
                <title>Compilador</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header className={styles.header}>
                <div className={styles.titleheader}>
                    <div className={styles.fileDiv}>
                        {/* <p className={styles.titlev}>Compiler.</p> */}
                    </div>
                </div>
            </header>

            <main>
                <div className={styles.center}>
                    <div className={styles.explorer}>
                        <Image
                            src={crear}
                            alt=""
                            width="60"
                            onClick={(e) => newFile()}
                        />
                        <input
                            type="file"
                            onChange={handleFileInput}
                            id="file"
                            className={styles.inputfile}
                        />
                        <label htmlFor="file">
                            <Image src={plus} alt="" width="60" />
                        </label>
                        <Image
                            src={play}
                            alt=""
                            width="60"
                            onClick={(e) => handleAnalizeCode()}
                        />
                        <Image
                            src={terminal}
                            alt=""
                            onClick={(e) => handleShowTerminal()}
                            width="60"
                        />
                        <div
                            className={
                                colapseOpens === ">" ? styles.hide : styles.show
                            }
                        >
                            {files?.map((file: any, index: number) => {
                                return (
                                    <div
                                        key={index}
                                        className={styles.file}
                                        onClick={(e) => changeCode(index)}
                                    >
                                        {inputChangeName &&
                                            inputChangeName[index] ? (
                                            <form
                                                onSubmit={(e) =>
                                                    handleChangeName(e, index)
                                                }
                                            >
                                                <input
                                                    type="text"
                                                    defaultValue={file.name}
                                                    name={`file${index}`}
                                                />
                                            </form>
                                        ) : (
                                            <input
                                                type={"button"}
                                                value={file.name}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {files.map((file: any, index: number) => {
                        return (
                            <TextEditor
                                key={index}
                                display={selectedFile !== index ? false : true}
                                editor={file}
                                saveFiles={saveFiles}
                                setSaveFiles={setSaveFiles}
                                files={files}
                                index={index}
                                onChange={setFiles}
                            />
                        );
                    })}
                </div>
            </main>

            {files[0] && showTerminal && (
                <div className={styles.terminal}>
                    <div className={styles.code}>
                        <span>Terminal</span>
                        <div>
                            <div className={styles.tableStyle}>
                                {errors && errors.length > 0 ? (
                                    <React.Fragment>
                                        {errors.map(
                                            (error: any, index: number) => (
                                                <span key={index}>{error}</span>
                                            )
                                        )}
                                        <br />
                                    </React.Fragment>
                                ) : (
                                    "Sin Errores"
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
