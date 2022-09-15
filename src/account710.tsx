import { Component, createEffect, createSignal, For } from "solid-js";
import styles from './App.module.css';
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

export const Account710: Component<AccountProps> = (props) => {
    const [is, setIs] = createSignal(false);
    const [gone, setGone] = createSignal(2);
    const [acp, setAcc] = createSignal<Acc710>({md: [], d: []})
    const [overall, setOverlord] = createSignal(0);
    createEffect(() => {
        let acc: Acc710 = {md: [], d: []}
        for (let i=0; i<props.acc.length; i++) {
            let x = props.acc[i];
            if (x.name.includes("5")) {
                let total = 0;
                for (let j=0; j<x.md.length; j++) total += x.md[j].cost;
                acc.md.push({name: x.name, cost: String(total)})
            } else if (x.name.includes("6")) {
                let total = 0;
                for (let j=0; j<x.d.length; j++) total += x.d[j].cost;
                acc.d.push({name: x.name, cost: String(total)})
            } else console.log(x.name)
        }
        setAcc(acc)
        console.log("L:",acc);
        return 0
    }, [props.acc, props.theme, props.s]);

    function check_list(t: OT) {
        try {
            if (t == OT.MD)
                if (acp().md)
                    money(String(acp().md.map(md => md.cost)
                        .reduce((a,b) => Number(a)+Number(b) , 0)))
            else 
                if (acp().d)
                    money(String(acp().d.map(d => d.cost)
                        .reduce((a,b) => Number(a)+Number(b) , 0)))
        } catch(e) {return 0}
    }

    return (
        <div class={styles.ucet} id="main_suck">
            <div class={styles.super}>
                <p>MD</p>
                <p>710</p>
                <p>D</p>
            </div>
            <hr/>
            <div class={styles.high}>
                <div class={styles.sub}>
                    <For each={acp().md}>
                        {(md, i) => (
                            <div class={(props.s != -1 ? props.acc[props.s].name == md.name ? styles.selected : "" : "")+" "+styles.row}>
                                <p>{md.name})&nbsp;</p>
                                <p>&nbsp;{money(String(md.cost))},-</p>
                            </div>
                        )}
                    </For>
                </div>
                <div class={styles.grade}></div>
                <div class={styles.sub + ""}>
                    <For each={acp().d}>
                        {(d, i) => (
                            <div class={(props.s != -1 ? props.acc[props.s].name == d.name ? styles.selected : "": "")+" "+styles.row}>
                                <p>{d.name})&nbsp;</p>
                                <p>&nbsp;{money(String(d.cost))},-</p>
                            </div>
                        )}
                    </For>
                </div>
            </div>
            <hr/>
            <div class={styles.high}>
                <div class={styles.sub}>
                    <div class={styles.row}>
                        <p>&nbsp;</p> <p>&nbsp;{check_list(OT.MD)},-</p>
                    </div>
                </div>
                <div class={styles.grade}>
                </div>
                <div class={styles.sub}>
                    <div class={styles.row}>
                        <p>&nbsp;</p> <p>&nbsp;{check_list(OT.D)},-</p>
                    </div>
                </div>
            </div>
            <hr hidden={gone() == 2}/>
            <div class={styles.high} hidden={gone() == 2}>
                <div class={styles.sub}>
                    <p class={styles.m0}> { gone() == 1 ? money(String(overall()))+",-": String.fromCharCode(160) } </p>
                </div>
                <div class={styles.grade}>
                </div>
                <div class={styles.sub}>
                    <p class={styles.m0}> { gone() == 0 ? money(String(overall()))+",-": String.fromCharCode(160) } </p>
                </div>
            </div>
        </div>)
}
