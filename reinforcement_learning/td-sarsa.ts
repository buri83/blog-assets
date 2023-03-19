type Action = "Right" | "Left";
type State = "S0" | "S1" | "S2" | "S3";

const qTable: Map<string, number> = new Map();
function getKey(s: State, a: Action): string {
    return `${s}:${a}`;
}

/**
 * 行動価値関数
 */
function Q(s: State, a: Action): number {
    const valueOfAction = qTable.get(getKey(s, a));
    if (valueOfAction === undefined) {
        return 0;
    }
    return valueOfAction;
}
function updateQ(s: State, a: Action, reward: number, nextS: State, nextA: Action): void {
    // 学習率: 0.1
    // 割引率: 0.9
    const newQ = Q(s, a) + 0.1 * (reward + 0.9 * Q(nextS, nextA) - Q(s, a));
    qTable.set(getKey(s, a), newQ);
}

/**
 * 状態 s で行動 a を行い、次の状態と報酬を得る
 */
function getActionResult(s: State, a: Action): { nextState: State; reward: number } {
    const nextStateAndRewards: {
        state: State;
        action: Action;
        nextState: State;
        reward: number;
    }[] = [
        { state: "S0", action: "Left", nextState: "S0", reward: 0 },
        { state: "S0", action: "Right", nextState: "S1", reward: 0 },

        { state: "S1", action: "Left", nextState: "S0", reward: 0 },
        { state: "S1", action: "Right", nextState: "S2", reward: 0 },

        { state: "S2", action: "Left", nextState: "S1", reward: 0 },
        { state: "S2", action: "Right", nextState: "S3", reward: 0 },

        // S3 でどんな行動をしても S0 に遷移して、報酬1 を得る
        { state: "S3", action: "Left", nextState: "S0", reward: 1 },
        { state: "S3", action: "Right", nextState: "S0", reward: 1 },
    ];

    const next = nextStateAndRewards.find((ns) => ns.state === s && ns.action === a);
    if (!next) throw new Error();
    return {
        nextState: next.nextState,
        reward: next.reward,
    };
}

/**
 * ε-greedy方策で次の行動を選択する
 */
function choiceAction(s: State): Action {
    const randomChoice = (): Action => {
        const moveRight = Math.random() <= 0.5;
        if (moveRight) {
            return "Right";
        } else {
            return "Left";
        }
    };

    // 10% の確率でランダムに行動を選択する
    if (Math.random() < 0.1) {
        return randomChoice();
    }

    const valueOfRightAction = Q(s, "Right");
    const valueOfLeftAction = Q(s, "Left");

    // 行動価値が同じ場合はランダムに行動を選択する
    if (valueOfLeftAction === valueOfRightAction) {
        return randomChoice();
    }

    // 行動価値が大きい行動を選択する
    if (valueOfRightAction > valueOfLeftAction) {
        return "Right";
    }
    return "Left";
}

async function main(): Promise<void> {
    let state: State = "S0";
    let action: Action = choiceAction(state);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < 10; i++) {
        let stepToGoal = 0;
        while (true) {
            await sleep(0);

            console.log("---------------------");
            console.log(`行動数: ${stepToGoal}`);
            console.log(`現在の状態: ${state}`);

            console.log(`選択された行動: ${action}`);

            const result = getActionResult(state, action);
            console.log(`遷移先: ${result.nextState}, 報酬: ${result.reward}`);

            const nextAction = choiceAction(state);

            // 行動価値関数の更新
            updateQ(state, action, result.reward, result.nextState, nextAction);

            state = result.nextState;
            action = nextAction;
            if (result.reward === 1) {
                console.log("> 報酬獲得！！！！\n\n");
                break;
            }
            stepToGoal++;
        }
    }

    for (const state of ["S0", "S1", "S2", "S3"] as State[]) {
        console.log(`Q(${state},Right) = ${Q(state, "Right")?.toFixed(3)}`);
        console.log(`Q(${state},Left) = ${Q(state, "Left")?.toFixed(3)}`);
    }
}
main();
