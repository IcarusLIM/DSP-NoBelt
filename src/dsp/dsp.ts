import { fromStr, toStr, type BeltParameters, type BlueprintBuilding, type BlueprintData, type InserterParameters } from "./parser"

const beltIds = new Set([2001, 2002, 2003])
const inserterIds = new Set([2011, 2012, 2013])
const reservedBeltIds = new Set([600, 601, 602, 603, 604])
const stationIds = new Set([2103, 2104])

function slotPerSide(buildingId: number) {
    return buildingId === 2309 ? 4 : 3 // 化工厂一侧4个接口
}

function isConnectToStation(buildings: BlueprintBuilding[], beltIdx: number) {
    const belt = buildings[beltIdx];
    return (belt.inputObjIdx >= 0 && stationIds.has(buildings[belt.inputObjIdx].itemId)) || (belt.outputObjIdx >= 0 && stationIds.has(buildings[belt.outputObjIdx].itemId))
}

function addInserterToMap(map: Map<string, Array<number>>, building: BlueprintBuilding, key?: string, slotId?: number) {
    if (key === undefined) {
        const offset0 = building.localOffset[0];
        const offset1 = building.localOffset[1];
        key = Math.round(offset0.x - offset1.x) + ":" + Math.round(offset0.y - offset1.y) + ":" + slotId
    }
    if (!map.has(key))
        map.set(key, []);
    map.get(key)?.push(building.index);
}

function adaptMirror(inputInserterMap: Map<string, number[]>, outputInserterMap: Map<string, Array<number>>) {
    if (outputInserterMap.size > 1) {
        // 产物分拣器位置不唯一，视为设备存在镜像旋转180的情况
        console.log(inputInserterMap)
        for (const key of inputInserterMap.keys()) {
            const splited = key.split(":")
            const mirrorKey = Math.abs(Number(splited[0])) + ":" + Math.abs(Number(splited[1])) + ":" + splited[2];
            if (key !== mirrorKey) {
                const buildings = inputInserterMap.get(key) || [];
                inputInserterMap.get(mirrorKey)?.push(...buildings);
                inputInserterMap.delete(key)
            }
        }
    }
}

function classifyBuildings(buildings: BlueprintBuilding[]) {
    const beltMap = new Map<number, number[]>()
    reservedBeltIds.forEach(i => beltMap.set(i, []))

    const inputInserterMap = new Map<string, Array<number>>()
    const outputInserterMap = new Map<string, Array<number>>()
    const inputInserterTaggedMap = new Map<string, Array<number>>()
    const outputInserterTaggedMap = new Map<string, Array<number>>()

    for (const building of buildings) {
        if (beltIds.has(building.itemId)) {
            if (isConnectToStation(buildings, building.index))
                continue
            const beltParams = building.parameters as BeltParameters
            if (beltParams === null || beltParams.iconId === null)
                continue
            const iconId = beltParams.iconId;
            if (!beltMap.has(iconId))
                beltMap.set(iconId, [])
            beltMap.get(iconId)?.push(building.index)
        } else if (inserterIds.has(building.itemId)) {
            let mode = null;
            if (building.outputObjIdx < 0 || building.outputToSlot === -1) {
                mode = "output"
            } else if (building.inputObjIdx < 0 || building.inputFromSlot === -1) {
                mode = "input"
            } else {
                throw (new Error("Unknown inserter: \n" + JSON.stringify(building, null, 2)))
            }

            if (building.filterId) {
                const map = mode === "input" ? inputInserterTaggedMap : outputInserterTaggedMap
                addInserterToMap(map, building, String(building.filterId))
            } else {
                let map, slotId, machine
                if (mode === "input") {
                    map = inputInserterMap
                    slotId = building.outputToSlot
                    machine = building.outputObjIdx
                } else {
                    map = outputInserterMap
                    slotId = building.inputFromSlot
                    machine = building.inputObjIdx
                }
                const modSlotId = slotId % slotPerSide(buildings[machine].itemId)
                addInserterToMap(map, building, undefined, modSlotId)
            }
        }
    }
    adaptMirror(inputInserterMap, outputInserterMap)
    return { beltMap, inputInserterMap, outputInserterMap, inputInserterTaggedMap, outputInserterTaggedMap }
}


function modifyInserter(buildings: BlueprintBuilding[], belts: Array<number>, inserters: Array<number>, mode: "input" | "output") {
    const per = Math.ceil(inserters.length / belts.length)
    console.log("modifyInserter", mode, per)
    let i = 0, j = 0;
    while (i < belts.length) {
        let count = 0
        const beltIdx = belts[i]
        while (count < per && j < inserters.length) {
            const inserterBuilding = buildings[inserters[j]]
            if (mode === "input") {
                inserterBuilding.inputObjIdx = beltIdx;
                inserterBuilding.inputFromSlot = -1;
            } else {
                inserterBuilding.outputObjIdx = beltIdx;
                inserterBuilding.outputToSlot = -1;
            }
            count++
            j++
        }
        i++;
    }
}

function modifyTagged(buildings: BlueprintBuilding[], beltMap: Map<number, number[]>, inputInserterMap: Map<string, number[]>, outputInserterMap: Map<string, number[]>) {
    inputInserterMap.forEach((val, key) => {
        modifyInserter(buildings, beltMap.get(Number(key)) || [], val, "input")
    })
    outputInserterMap.forEach((val, key) => {
        modifyInserter(buildings, beltMap.get(Number(key)) || [], val, "output")
    })
}

function modifyReserved(buildings: BlueprintBuilding[], beltMap: Map<number, number[]>, inputInserterMap: Map<string, number[]>, outputInserterMap: Map<string, number[]>) {
    const beltIds = Array.from(reservedBeltIds).sort();
    const outputInserter: number[] = []
    outputInserterMap.forEach((val) => outputInserter.push(...val))
    modifyInserter(buildings, beltMap.get(beltIds[0]) || [], outputInserter, "output")

    // 标号排序，让短爪子连号多的传送带
    const inputBeltList: number[][] = []
    beltMap.forEach((val, key) => {
        if (reservedBeltIds.has(key) && key !== beltIds[0]) {
            inputBeltList.push(val)
        }
    })
    inputBeltList.sort(i => i.length)
    const inputInserterList = Array.from(inputInserterMap.entries()).sort(e => {
        const key = e[0].split(":");
        return Math.abs(Number(key[0])) + Math.abs(Number(key[1])); // inserter length Approximately
    }).map(i => i[1])
    for (let i = 0; i < inputBeltList.length && i < inputInserterList.length; i++) {
        modifyInserter(buildings, inputBeltList[i], inputInserterList[i], "input")
    }
}

export function convert(strData: string, eraseTag: boolean) {
    const bp = fromStr(strData)

    const { beltMap, inputInserterMap, outputInserterMap, inputInserterTaggedMap, outputInserterTaggedMap } = classifyBuildings(bp.buildings)

    modifyReserved(bp.buildings, beltMap, inputInserterMap, outputInserterMap)
    modifyTagged(bp.buildings, beltMap, inputInserterTaggedMap, outputInserterTaggedMap)

    if (eraseTag) {
        // todo
    }

    return toStr(bp)
}