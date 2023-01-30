import { Accessor,  Setter, writeSignal } from "solid-js/types/reactive/signal";
import { MOVE, OHT, Operation, OperationHistory, OT } from "./type";
import { Component, ParentComponent, createEffect, createSignal } from "solid-js";
import styles from './App.module.css';
import { money, move } from "./util";

//    h, sh, opt, i, setSelected, opts, sel, theme, money, 

type OptProps = {
    opt: Operation
    h: OperationHistory[],
    sh: Setter<OperationHistory[]>,
    setSelected: Setter<number>,
    setOpts: Setter<Operation[]>,
    i: number,
    sel: Accessor<number>,
    opts: Operation[],
    theme: Boolean,
    smart: Boolean,
    indexing: Boolean
}

export const Opt: Component<OptProps> = (props) => {
    function chSel(e: Event) {
        let element = e.target as HTMLElement;
        element = element.parentElement as HTMLElement;

        console.log(props.sel(), props.i)

        if (props.sel() == props.i) {
            element.classList.remove(styles.opt_selected)
            props.setSelected(-1);
        } else {
            if (props.sel() != -1) {
                let pax = element.parentElement?.children[props.sel()+1]
                if (pax) pax.classList.remove(styles.opt_selected)
            }
            element.classList.add(styles.opt_selected)
            props.setSelected(props.i);
        }
    }
    function del(e: Event) {
        e.stopPropagation();
        const x  = e.target as HTMLInputElement;
        if (parseInt(x.value) < 0) return;
        let s = parseInt(x.value)
        props.setOpts([...props.opts.slice(0, s), ...props.opts.slice(s+1)])
        let opr = props.opts[parseInt(x.value)];

        props.sh([...props.h, {type: OHT.DEL, old: {
            md: opr.md, d: opr.d, cost: opr.cost
        }, i: parseInt(x.value)}])
    }
    function check(e: Event, n: number, n1: MOVE) {
        e.stopPropagation();
        let x = e.target as HTMLInputElement;
        let val = parseInt(x.value)
        if (val == 0 && n1 == MOVE.DOWN) return;
        props.setOpts(move(props.opts, n, n1));
        props.sh([...props.h, {type: OHT.MOVE, old: {
            md: props.opts[val].md, d: props.opts[val].d, cost: props.opts[val].cost
        }, i: val, m: n1}])
    }
    const up = (e: Event) => check(e, props.i, MOVE.DOWN);
    const down = (e: Event) => check(e, props.i, MOVE.UP);
    let sel_p = "";
    if (props.sel() == props.i+1) {
        sel_p = styles.opt+" "+styles.snav;
        if (props.theme) sel_p += " "+styles.white_sel;
    } else sel_p = styles.opt

    return (
        <tr class={sel_p} onClick={e => {chSel(e)}}>
            <td class={styles.first}>{ props.i+1}</td>
            <td hidden={true}>{ props.i+1 }</td>
            <td class={styles.between}>
                <button onClick={e => up(e)} value={String(props.i)}>&uarr;</button>
                <button onClick={e => down(e)} value={String(props.i)}>&darr;</button>
            </td>
            <td class={styles.cost}>{money(String(props.opt.cost))}</td>
            <td class={styles.side_acc}>{props.opt.md}</td>
            <td class={styles.side_acc+" "+styles.last}>{props.opt.d}</td>
            <td>
                <button class={styles.p58} value={String(props.i)} onClick={del}>&times;</button>
            </td>
        </tr>
    )
}
