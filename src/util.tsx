import { createEffect } from "solid-js";
import {createStore, SetStoreFunction, Store} from "solid-js/store";
import { Account, AccountSides, MOVE, Operation, OT } from "./type";

export function createLocal<T extends object>(name: string, init: T): [Store<T>, SetStoreFunction<T>] {
    const [state, setState] = createStore(init);
    if (localStorage.getItem(name)) 
        setState(JSON.parse(localStorage.getItem(name) || "[]"));
    createEffect(() => (localStorage.setItem(name, JSON.stringify(state))));
    return [state, setState];
}

export function removeLocal<T>(array: readonly T[], index: number): T[] {
    return [...array.slice(0, index), ...array.slice(index+1)];
}
export function money(n: string) {
    let cox = parseInt(n)%100 || 0 ;

    if (cox < 0 ) cox *= -1;

    let nl = Math.floor(parseInt(n)/100) || 0;
    let ans = "";
    var edit_number = String(nl);

    for (let i=edit_number.length; i>0; i-=3) {
     ans = edit_number.substring(i-3, i) + "\u00a0" + ans;
    }
    if (n.length < 1 || n.trim() == "0") return "";
    return ans.trim()+"."+
        Math.floor((cox%100)/10)+cox%10
        String.fromCharCode(160)+",-";
}

export function money_pre(n: string) {
    let cox = "";
    if (n.includes(".")){
        cox = "."+n.split(".")[1];
    } else if (n.includes(",")) {
        cox = "."+n.split(",")[1];
    }
    let ans = "";
    var edit_number = String(parseInt(n));

    for (let i=edit_number.length; i>0; i-=3) {
     ans = edit_number.substring(i-3, i) + "\u00a0" + ans;
    }
    if (n.length < 1 || n.trim() == "0") return "";
    return ans.trim()+cox+String.fromCharCode(160)+",-";
}

function check_side(sides: AccountSides[], i: number, cost: number) {
    if (sides) sides.push({i: i, cost: cost});
    else sides = [{i: i, cost: cost}];
    return sides;
}

function check_first(accs: Account[], opt: Operation, i: number): [Account[], boolean[]] {
    let is_there = [false, false];
    for (let j=0; j<accs.length; j++) {
        if (accs[j].name.substring(0,3) == opt.md.substring(0,3)) {
            accs[j].md = check_side(accs[j].md, i, opt.cost);
            is_there[0] = true;
        }
        if (accs[j].name.substring(0,3) == opt.d.substring(0,3)) {
            accs[j].d = check_side(accs[j].d, i, opt.cost);
            is_there[1] = true;
        }

    }
    return [accs, is_there];
}

export function checkOperations(opts: Operation[]) {
    let accounts: Account[] = [];
    opts.map((opt, i) => {
        let is_there = [false, false];
        [accounts, is_there] = check_first(accounts, opt, i);

        if (!is_there[0] && !is_there[1] && opt.md == opt.d) {
            accounts.push({
                name: opt.md, 
                md: [{i: i, cost: opt.cost}], 
                d: [{i: i, cost: opt.cost}]
            });
        } else {
            if (!is_there[0])
                accounts.push({
                    name: opt.md, md: [{i: i, cost: opt.cost}], d: []
                });
            if (!is_there[1]) {
                accounts.push({
                    name: opt.d, md: [], d: [{i: i, cost: opt.cost}]
                });
            }
        }
    })
    console.log("acc from check", accounts);
    return accounts;
}
export function move(opts: Operation[], n: number | undefined, n1: MOVE | undefined): Operation[] {
    console.log(" is it", opts, n, n1)
    if (n == undefined || n1 == undefined || 
        n1 == MOVE.UP && n == opts.length-1 || 
        n1 == MOVE.DOWN && n == 0)  return opts;
    let opts_new = [...opts];
    let opt;
    if (n1 == MOVE.DOWN) {
        opt = opts_new[n-1]
        opts_new[n-1] = opts_new[n]
    } else {
        opt = opts_new[n+1]
        opts_new[n+1] = opts_new[n]
    }
    opts_new[n] = opt;

    console.log(opts_new, opt);
    return opts_new;
}
