import { Component, createEffect, createSignal, For } from "solid-js";
import styles from './App.module.css';
import { AccountsList } from "./datalist";
import { Account, OT } from "./type";
import { CAL, money } from "./util";

type AccountProps = {
    acc: Account[],
    s: number
    theme: Boolean
}
type Acc710 = {
    md: SideAcc710[],
    d: SideAcc710[],
}
type SideAcc710 = {
    name: string,
    cost: string
}

export const Account702: Component<AccountProps> = (props) => {
    const [is, setIs] = createSignal(false);
    const [gone, setGone] = createSignal(2);
    const [acp, setAcc] = createSignal<Acc710>({md: [], d: []})
    const [total_acp, setTotal] = createSignal<{md: number, d: number}>({md: 0, d: 0})
    const [overall, setOverlord] = createSignal(0);
    createEffect(() => {
        let acc: Acc710 = {md: [], d: []}
        for (let i=0; i<props.acc.length; i++) {
            let x = props.acc[i];
            // check on what side it would be
            AccountsList.map(aco => {
                if (x.name.includes(aco.name) && !x.name.startsWith("5") && !x.name.startsWith("6")) {
                    let calculate = 0;
                    if (x.md) calculate += (x.md.reduce((a,b) => a+b.cost, 0) * (aco.type ? 1 : -1));
                    if (x.d) calculate -= (x.d.reduce((a,b) => a+b.cost, 0) * (aco.type ? 1 : -1));

                    if (aco.type)
                        acc.md.push({name: x.name, cost: String(calculate)})
                    else acc.d.push({name: x.name, cost: String(calculate)})
                }
            })
            // console.log("acc:", acc)
        }
        setAcc(acc)
        return 0
    }, [props.acc, props.theme, props.s]);
    function is_gone(x: number, y: number) {
        if (x == y) {
            setGone(0); setOverlord(0);
        } else if (x > y) {
            setGone(1); setOverlord(x-y);
        } else if (x < y) { 
            setGone(2); setOverlord(y-x);
        }
    }

    function check_list(t: OT): string {
        let x = acp().md.map(x=>x.cost).reduce((a,b)=>Number(a)+Number(b), 0);
        let y = acp().d.map(x=>x.cost).reduce((a,b)=>Number(a)+Number(b), 0);
        is_gone(x, y);
        if (x != 0 && t == OT.MD) return money(String(x));
        if (y != 0 && t == OT.D) return money(String(y));
        return "";
    }

    return (
        <div class={styles.ucet+" "+styles.just_suck+" "+(props.theme ? "":styles.white)} id="main_suck">
            <div class={styles.super}>
                <p>MD</p>
                <p>702</p>
                <p>D</p>
            </div>
            <hr/>
            <div class={styles.high+" "+styles.a7}>
                <div class={styles.sub}>
                    <For each={acp().md}>
                        {(md, _) => (
                            <div class={styles.row+" "+styles.a7auto}>
                                <p>{md.name})&nbsp;</p>
                                <p>&nbsp;{money(String(md.cost))}</p>
                            </div>
                        )}
                    </For>
                </div>
                <div class={styles.grade}></div>
                <div class={styles.sub+" "+styles.h2}>
                    <For each={acp().d}>
                        {(d, _) => (
                            <div class={styles.row+" "+styles.a7auto}>
                                <p>{d.name})&nbsp;</p>
                                <p>&nbsp;{money(String(d.cost))}</p>
                            </div>
                        )}
                    </For>
                </div>
            </div>
            <hr/>
            <div class={styles.high}>
                <div class={styles.sub}>
                    <div class={styles.row}>
                        <p>&nbsp;</p> <p>&nbsp;{check_list(OT.MD)}</p>
                    </div>
                </div>
                <div class={styles.grade}>
                </div>
                <div class={styles.sub}>
                    <div class={styles.row}>
                        <p>&nbsp;</p> <p>&nbsp;{check_list(OT.D)}</p>
                    </div>
                </div>
            </div>
            <hr hidden={gone() == 0}/>
            <div class={styles.high} hidden={gone() == 0}>
                <div class={styles.sub}>
                    <p class={styles.m0}> { gone() == 1 ? money(String(overall())): String.fromCharCode(160) } </p>
                </div>
                <div class={styles.grade}>
                </div>
                <div class={styles.sub}>
                    <p class={styles.m0}> { gone() == 2 ? money(String(overall())): String.fromCharCode(160) } </p>
                </div>
            </div>
        </div>)
}
