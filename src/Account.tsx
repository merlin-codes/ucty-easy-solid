import { Accessor, Component, createEffect, createSignal, For } from "solid-js"
import { Account, AccountSides, OT } from "./type"
import styles from './App.module.css';
import { money } from "./util";
import { AccountsList } from './datalist';

type AccountProps = {
    acc: Account,
    i: number,
    s: number
    theme: Boolean,
    hidden: Boolean,
}

/*
 * Last Problem is that selecting option sometimes makes Account show in bad way
*/

export const AccountComponent: Component<AccountProps> = (props) => {
    const [is, setIs] = createSignal(false);
    const [gone, setGone] = createSignal(2);
    const [hidden, setHidden] = createSignal(false);
    const [overall, setOverlord] = createSignal(0);
    const [info, setInfo] = createSignal("");

    createEffect(() => {
        let isit = false;
        let x: Account = props.acc;
        try {
            x.md.map(md => md.i == props.s ? isit = true: false);
        } catch(e) {false}
        try {
            x.d.map(d => d.i == props.s ? isit = true: false);
        } catch(e) {false}
        setIs(isit)
    }, [props.s])

    createEffect(() => {
        let md, d;
        try { md = (props.acc.md.map(md => md.cost)).reduce((a,b) => a+b) } 
        catch(e) { md = 0 }

        try { d = (props.acc.d.map(d => d.cost)).reduce((a,b) => a+b) || 0 }
        catch(e) { d = 0 }

        if (d > md) {setGone(0); setOverlord(d-md)}
        else if (d == md) {setGone(2); setOverlord(0)}
        else {setGone(1); setOverlord(md-d)}
    }, [props.acc, props.s])

    const not_show = ["5", "6"];
    createEffect(() => {
        let s = AccountsList.filter(acc => props.acc.name.includes(acc.name))[0];
        setInfo(s.text);
        for (let i=0; i<not_show.length; i++)
            if (props.acc.name && props.acc.name.startsWith(not_show[i]) || props.hidden)
                setHidden(true)
    }, [])
    createEffect(() => {
        let element = document.getElementById("main_"+props.i);
        let new_clas = [];

        if (is()) new_clas.push(styles.b_sel);
        else element?.classList.remove(styles.b_sel);

        if (is() && !props.theme) new_clas.push(styles.white_sel)
        else element?.classList.remove(styles.white_sel);

        if (!is() && !props.theme) new_clas.push(styles.white)
        else element?.classList.remove(styles.white);
        
        for (let i=0; i<new_clas.length; i++)
            element?.classList.add(new_clas[i])
    }, [is, props.theme])

    function check_list(t: OT) {
        try {
            if (t == OT.MD && props.acc.md)
                return money(String(props.acc.md.map(md => md.cost)
                    .reduce((a,b) => Number(a)+Number(b) , 0))) || 0
            else if (props.acc.d)
                 return money(String(props.acc.d.map(d => d.cost)
                    .reduce((a,b) => Number(a)+Number(b) , 0))) || 0
        } catch(e) {
            return "";
        }
    }
    function hide(e: Event) {
        e.stopPropagation();
        setHidden(!hidden())
    }

    return (
        <div class={styles.ucet} id={"main_"+props.i}>
            <div onClick={e => hide(e)} class={styles.hover + " " + styles.super}>
                <p>MD</p>
                <p>{ props.acc.name }</p>
                <p>D</p>
            </div>
            <hr/>
            <div hidden={hidden()} class={styles.high}>
                <div class={styles.sub} >
                    { hidden() ? <div></div> :
                    <For each={props.acc.md}>
                        {(md) => (
                            <div class={(props.s == md.i ? styles.selected : "")+" "+styles.row}>
                                <p>{md.i+1})&nbsp;</p>
                                <p>&nbsp;{money(String(md.cost))}</p>
                            </div>
                        )}
                    </For>
                    }
                </div>
                <div class={styles.grade}></div>
                <div class={styles.sub + ""}>
                    { hidden() ? <div></div> :
                    <For each={props.acc.d}>
                        {(d) => (
                            <div class={(props.s == d.i ? styles.selected : "")+" "+styles.row}>
                                <p>{d.i+1})&nbsp;</p>
                                <p>&nbsp;{money(String(d.cost))}</p>
                            </div>
                        )}
                    </For>
                    }
                </div>
            </div>
            <hr hidden={hidden()} />
            <div hidden={hidden()} class={hidden() ? styles.dnone: styles.high}>
                <div class={styles.sub}>
                    <div class={styles.row}>
                        <p>&nbsp;</p> <p>&nbsp;{hidden() ? "": check_list(OT.MD)}</p>
                    </div>
                </div>
                <div class={styles.grade}>
                </div>
                <div class={styles.sub}>
                    <div class={styles.row}>
                        <p>&nbsp;</p> <p>&nbsp;{hidden() ? "": check_list(OT.D)}</p>
                    </div>
                </div>
            </div>
            <hr hidden={gone() == 2 || hidden()}/>
            <div class={styles.high} hidden={gone() == 2}>
                <div class={styles.sub}>
                    <p class={styles.m0}> { gone() == 1 ? money(String(overall())): String.fromCharCode(160) } </p>
                </div>
                <div class={styles.grade}>
                </div>
                <div class={styles.sub}>
                    <p class={styles.m0}> { gone() == 0 ? money(String(overall())): String.fromCharCode(160) } </p>
                </div>
            </div>
        </div>)
}
