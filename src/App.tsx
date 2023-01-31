import { Component, createEffect, createSignal, For } from 'solid-js';

import styles from './App.module.css';
import { Account, OHT, Operation, OperationHistory } from './type';
import { checkOperations, createLocal, money, move, removeLocal } from './util';
import { Opt } from "./Opt";
import { Add } from './Add';
import { AccountComponent } from './Account';
import { Account710 } from './account710';
import { Account702 } from './account702';


const App: Component = () => {
    const [theme, setTheme] = createSignal<Boolean>((Number(localStorage.getItem("theme")) == 0? true: false) || false);
    const [selected, select] = createSignal<number>(-1);
    const [operations, setOperations] = createLocal<Operation[]>("operations", []);
    const [history, setHistory] = createLocal<OperationHistory[]>("history", []);
    const [accounts, setAccounts] = createSignal<Account[]>([]);
    const [numbering, setNumber] = createSignal<number>(0);
    const [RUR, setRUR] = createSignal<Boolean>(false);
    const [hALL, setHAll] = createSignal<Boolean>(false);

    createEffect(() => {
        let buttons = document.getElementsByTagName("button");
        for (let i=0; i<buttons.length; i++) {
            if (theme()) 
                buttons[i].classList.remove(styles.btn_dark)
            else buttons[i].classList.add(styles.btn_dark)
        }
        setOperations([...operations]);
    }, [theme]);
    createEffect(() => localStorage.setItem("theme", String(theme())), [theme]);
    createEffect(() => { 
        let acts = checkOperations(operations);
        acts.sort((a,b) => a.name > b.name ? 1 : (b.name > a.name) ? -1 : 0);
        setAccounts(acts);

    }, [operations, selected]);
    createEffect(() => console.log(history), [history])

    function change_to(i: number, x: Operation) {
        let before = operations.slice(0,i);
        let after = operations.slice(i);
        console.log(i, x);
        console.log([...before, x, ...after]);
        if (i != -1)
            before = before.concat(x);
        // let mix = operations[i];
        // if (i != -1) return setOperations([...before, ...(mix ? [x, mix] : [x]), ...after])
        setOperations([...before, ...after])
    }
    
    function back() {
        if (history.length < 1) return console.log("No history");

        const opt_history = history[history.length-1];
        setHistory([...history.filter(t => t.i != opt_history.i)])
        console.log("History? ",history, opt_history)

        switch(opt_history.type) {
            case OHT.ADD:
                console.log("OHT: adding")
                return change_to(-1, opt_history.old)
            case OHT.DEL:
                console.log("OHT: deleting")
                return change_to(opt_history.i, opt_history.old)
            case OHT.MOVE:
                console.log("OHT: moving")
                return setOperations(
                    move(operations, opt_history.i, opt_history.m)
                );
            case OHT.UPDATE:
                console.log("OHT: updating")
                return change_to(opt_history.i || -1, opt_history.old)
            default: 
                return console.log("not same? \n", opt_history);
                // alert("Hi, this is weird but you don't have any history, do you want to make one?")
        }
    }
    async function load(e: Event) {
        let x = await navigator.clipboard.readText();
        let list = x.trim().split(";\n").map(x => {
            let y = x.split(", ");
            let [cost, decimal] = y[0].split(".");

            let [md, d] = [y[1], y[2]];
            console.log(y[0], y[0].split("."))
            return {cost: parseInt(cost)*100 + parseInt(decimal), md: md, d: d};
        });
        console.log(list);
        setOperations(list);
    }
    function expo(e: Event) {
        let copy = "";
        operations.map(opt => {
            copy += (`${Math.floor(opt.cost/100)}.${Math.floor(opt.cost%100)/10}${opt.cost%10}, ${opt.md}, ${opt.d};\n`);
        })
        navigator.clipboard.writeText(copy);
    }
    const clear = () => {
        setOperations([]);
        setHistory([]);
    }
    const smart_filter = ["343", "701"];
    function check_them(x: String): boolean {
        return smart_filter.filter(y => x.substring(0,3).includes(y)).length > 0
    }

    return (
        <div class={theme() ? styles.body : styles.body_dark}>
            <section class={theme() ? styles.rozvaha : styles.rozvaha+" "+styles.white}>
                <h1>
                    <button onClick={load}>&#9997;</button> {/* import */}
                    <button onClick={expo}>&#9995;</button> {/* export */}
                    {/* Operace: &nbsp; */}
                    <button class={theme() ? "" : "white_btn"} onClick={() => setTheme(!theme()) }>
                        {theme() ? "dark" : "white"}
                    </button>
                    <button onClick={e => setRUR(!RUR())}>RUR</button>
                    <button onClick={e => setHAll(!hALL())}>ALL</button>
                    <button onClick={clear}>Vycistit</button>
                </h1>
                <table class={styles.show} id="taxer">
                    <tbody>
                        <tr class={styles.nav+" "+styles.vr_b}>
                            <td>N</td><td></td> <td>Cena</td> <td>MD</td> <td>D</td>
                        </tr>
                        <For each={operations}>
                            {(opt, i) => {
                                let see = true;
                                let local_n = -1;

                                // operations.filter((o,j) => (check_them(o.md) || check_them(o.d)) && j < i()).length;
                                if (!check_them(opt.md) && !check_them(opt.d)) setNumber(numbering()+1)
                                
                                else see = false;

                                local_n = numbering();

                                return (
                                    <Opt opt={opt} indexing={false} i={i()} opts={operations} 
                                        smart={false} setSelected={select} h={history} 
                                        sh={setHistory} setOpts={setOperations} sel={selected} 
                                        theme={theme()}/>
                                )
                            }} 
                        </For>
                        <tr id="end"> <td></td> </tr>
                    </tbody>
                </table>
                <Add setOpts={setOperations} opt={operations} theme={theme()} h={history} sh={setHistory}
                    selected={selected} setSelected={select} />
            </section>
            <section class={styles.disk_box+" random"}>
                <For each={accounts()}>
                    {(acc, i) => (
                        <AccountComponent hidden={hALL()} acc={acc} i={i()} s={selected()} theme={theme()} />
                    )}
                </For>
            </section>
            <section class={RUR() ? styles.dnone : styles.disk_box}>
                <Account710 acc={accounts()} s={selected()} theme={theme()}/>
                <Account702 acc={accounts()} s={selected()} theme={theme()}/>
            </section>
        </div>
    );
};

export default App;
