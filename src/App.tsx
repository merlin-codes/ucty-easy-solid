import { Component, createEffect, createSignal, For } from 'solid-js';

import styles from './App.module.css';
import { Account, OHT, Operation, OperationHistory } from './type';
import { checkOperations, createLocal, money, move } from './util';
import {Opt} from "./Opt";
import { Add } from './Add';
import { AccountComponent } from './Account';
import { Account710 } from './account710';


const App: Component = () => {
    const [theme, setTheme] = createSignal<Boolean>(true);
    const [selected, select] = createSignal<number>(-1);
    const [operations, setOperations] = createLocal<Operation[]>("operations", []);
    const [history, setHistory] = createLocal<OperationHistory[]>("history", [])
    const [accounts, setAccounts] = createSignal<Account[]>([])

    createEffect(() => {
        setAccounts(checkOperations(operations))
    }, [operations, selected])

    createEffect(() => {
        let buttons = document.getElementsByTagName("button");
        for (let i=0; i<buttons.length; i++) {
            if (theme()) 
                buttons[i].classList.remove(styles.btn_dark)
            else buttons[i].classList.add(styles.btn_dark)
        }
    }, [theme])

    
    function back() {
        if (history.length < 1) return console.log("No history");

        const opt_history = history[history.length-1];
        setHistory(history.filter((_, i) => i != history.length-1));
        switch(opt_history.type) {
            case OHT.ADD:
                return setOperations([...operations.filter((_, i) => i == operations.length-1)])
            case OHT.DEL:
                let i = opt_history.i || -1;
                return setOperations( operations.slice(0, i).concat(operations.slice(i+1)))
            case OHT.MOVE:
                return setOperations( move(operations, opt_history.i, opt_history.m));
            case OHT.UPDATE:
                return setOperations([
                    ...operations.filter((_, i) => i != opt_history.i), 
                    opt_history.old
                ]);
            default: 
                return console.log("not same? \n", opt_history);
                // alert("Hi, this is weird but you don't have any history, do you want to make one?")
        }
    }
    const clear = () =>  setOperations([]);

    return (
        <div class={theme() ? styles.body : styles.body_dark}>
            <section class={theme() ? styles.rozvaha : styles.rozvaha+" "+styles.white}>
                <h1>
                    Operace: &nbsp;
                    <button class={theme() ? "" : "white_btn"} onClick={() => setTheme(!theme()) }>
                        {theme() ? "dark" : "white"}
                    </button>
                    <button onClick={back}>← zpet</button>
                    <button onClick={clear}>Vycistit</button>
                </h1>
                <table class={styles.show}>
                    <tbody>
                        <tr class={styles.nav+" "+styles.vr_b}>
                            <td>N</td><td></td> <td>Cena</td> <td>MD</td> <td>D</td>
                        </tr>
                        <For each={operations}>
                            {(opt, i) => (
                                <Opt opt={opt} i={i()} opts={operations} 
                                setSelected={select} h={history} sh={setHistory}
                                    setOpts={setOperations} sel={selected} 
                                    theme={theme()}/>
                            )} 
                        </For>
                    </tbody>
                </table>
                <Add setOpts={setOperations} opt={operations} theme={theme()} h={history} sh={setHistory}
                    selected={selected} setSelected={select} />
            </section>
            <section class={styles.disk_box+" random"}>
                <For each={accounts()}>
                    {(acc, i) => (
                        <AccountComponent acc={acc} i={i()} s={selected()} theme={theme()}/>
                    )}
                </For>
            </section>
            <section class={styles.disk_box}>
                <Account710 acc={accounts()} s={selected()} theme={theme()}/>
            </section>
        </div>
    );
};

export default App;
