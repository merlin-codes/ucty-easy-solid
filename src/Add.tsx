import { Accessor, batch, Component, createEffect, createSignal } from "solid-js"
import { SetStoreFunction } from "solid-js/store/types"
import { OHT, Operation, OperationHistory, OT } from "./type"
import styles from './App.module.css';
import { DataList } from "./datalist";
import { money_pre, money } from "./util";

type AddProps = {
    setOpts: SetStoreFunction<Operation[]>,
    opt: Operation[],
    theme: Boolean,
    h: OperationHistory[],
    sh: SetStoreFunction<OperationHistory[]>,
    selected: Accessor<number>,
    setSelected: SetStoreFunction<number>
}

export type BASE_ADD = {
    cost: string,
    md: string,
    d: string
}
const emp = String.fromCharCode(8291);
// setOpts={setOperations} opt={operations} theme={theme} h={history} sh={setHistory} selected={selected} setSelected={select}
export const Add: Component<AddProps> = (props) => {
    const [value, setValue] = createSignal<BASE_ADD>({cost: "", md: "", d: ""});
    const [edit, setEdit] = createSignal(false);
    const [DPH, setDPH] = createSignal([false, false]);
    const [DPH_VALUE, setDPHValue] = createSignal(21);
    
    function changeSide(e: Event, x: OT) {
        e.stopPropagation();
        let val = (e.target as HTMLInputElement).value || "";
        if (x == OT.COST) return ch(val, x);
        if (val.length == 3) {
            if (x == OT.MD && String(value().md).includes(emp)) 
                ch(val.substring(0, 2), x);
            else if (x == OT.D && String(value().d).includes(emp)) 
                ch(val.substring(0, 2), x);
            else ch(val+emp, x)
        } else ch(val, x)
    }
    function ch(val: string, x: OT) {
        let vax = {cost: value().cost, md: value().md, d: value().d};
        if (x == OT.D)          vax.d       = val;
        else if (x == OT.MD)    vax.md      = val;
        else if (x == OT.COST)  vax.cost    = val;
        setValue(vax)
    }
    const chMD = (e: Event) => changeSide(e, OT.MD)
    const chCost = (e: Event) => changeSide(e, OT.COST);
    const chD = (e: Event) => changeSide(e, OT.D);

    createEffect(() =>  scroll_down())
    createEffect(() => {
        if (props.selected() == -1) {
            setValue({cost: "", md: "", d: ""})
            return setEdit(false)
        }
        setEdit(true);
        let v = props.opt[props.selected()];
        setValue({cost: String(v.cost), md: v.md, d: v.d})
    }, [props.selected])

    function scroll_down() {
        let e = document.getElementById("taxer");
        if (e == undefined) return;
        e.scroll(0, e.scrollHeight);
    }
    createEffect(scroll_down, [props.opt, props.h]);
    
    function editIt() {
        let opts = props.opt;
        props.sh([...props.h, {type: OHT.UPDATE, old: opts[props.selected()], i: props.selected()}])

        props.setOpts([
            ...opts.slice(0, props.selected()),
            {cost: parseInt(value().cost), md: value().md, d: value().d},
            ...opts.slice(props.selected()+1),
        ]);
        props.setSelected(-1);
    }
    function genNum(cost: number) { return {cost: cost, md: value().md, d: value().d}; }
    function addIt() {
        const sect = parseInt((value().cost.split(/[,.]/)[1] || "00").substring(0,2)) || 0 ;
        const cost = parseInt(value().cost)*100 + sect;
        let md = value().md
        let d = value().d

        if (cost == 0 || md.length != 4 || d.length != 4) return;

        md = md.substring(0, 3);
        d = d.substring(0, 3);

        let opts = [genNum(cost)]
        props.sh([...props.h, {type: OHT.ADD, old: {md: "", d: "", cost: 0}}])

        if (DPH()[0] || DPH()[1]) {
            let opt = genNum(cost * (DPH_VALUE()/100) || 0);
            if (DPH()[0]) opt.md = "343⁣";
            else opt.d = "343";
            opts.push(opt)
            props.sh([...props.h, {type: OHT.ADD, old: {md: "", d: "", cost: 0}}])
        }
        setDPHValue(21);
        batch(() => {
            for(let i=0; i<opts.length; i++) 
                props.setOpts(props.opt.length, opts[i])
            setValue({cost: "", md: "", d: ""});
            setDPH([false, false]);
        })
        scroll_down();
    }
    createEffect(() => {
        console.log(DPH_VALUE())
    }, [DPH_VALUE]);
    const execute = () => edit() ? editIt() : addIt();

    return (
        <div class={styles.bottom+" "+styles.vr_t}>
            <DataList /><datalist id="empty"></datalist>
            <p>
                <label for="cost">Cena</label>
                {value().cost != "" ? edit() ? money(value().cost) : money_pre(value().cost) : ""}
                <input autocomplete="off" class={props.theme ? styles.col_lg: styles.col_lg+" "+styles.white_btn} id="cost" placeholder="Cena"
                value={value().cost} onInput={chCost} />
            </p>
            <p>
                <label for="md">MD</label>
                <span hidden={edit()}>
                    <input type="checkbox" name="mdon" id="permd" checked={DPH()[0]} onChange={_ => setDPH([!DPH()[0], false])}/>
                    <select hidden={!DPH()[0]} value={DPH_VALUE()} onChange={e => setDPHValue(e.target?.value || 0)}>
                        <option value="21" selected={DPH_VALUE() == 21}>21 %</option>
                        <option value="15" selected={DPH_VALUE() == 15}>15 %</option>
                        <option value="10" selected={DPH_VALUE() == 10}>10 %</option>
                    </select>
                </span>
                <input autocomplete="off" list="account-UCTO" class={props.theme ? styles.col_lg: styles.col_lg+" "+styles.white_btn} placeholder="MD"
                id="md" value={value().md} onInput={e => chMD(e)}/>
            </p>
            <p>
                <label for="d">D</label>
                <span hidden={edit()}>
                    <input type="checkbox" name="don" id="perd" checked={DPH()[1]} onChange={_ => setDPH([false, !DPH()[1]])}/>
                    <select hidden={!DPH()[1]} value={DPH_VALUE()} onChange={e => setDPHValue(e.target?.value || 0)}>
                        <option value="21" selected={DPH_VALUE() == 21}>21 %</option>
                        <option value="15" selected={DPH_VALUE() == 15}>15 %</option>
                        <option value="10" selected={DPH_VALUE() == 10}>10 %</option>
                    </select>
                </span>
                <input autocomplete="off" list="account-UCTO" class={props.theme ? styles.col_lg: styles.col_lg+" "+styles.white_btn} placeholder="D"
                id="d" value={value().d} onInput={e => chD(e)} />
            </p>
            <p>
                <button id="addbtn" class={props.theme ? "": styles.white_btn} onClick={execute}>{edit() ? "Zmenit" : "Pridat"}</button>
            </p>
        </div>
    )
}
