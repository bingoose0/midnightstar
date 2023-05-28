export default interface Item {
    name: string,
    id: string,
    price: number,
    type: string
}

export const ItemList = new Array<Item>();
export const ItemMap = new Map<String, Item>();

ItemList.push(
    // Weaponry
    { name: "Axe", price: 20, id: "axe", type: "weapon" },
    { name: "Pickaxe", price: 75, id: "pickaxe", type: "weapon" },
    { name: "USP Match", price: 175, id: "usp", type: "weapon" },
    { name: "M1911", price: 220, id: "m1911", type: "weapon" },
    { name: "DB Shotgun", price: 200, id: "dbshotgun", type: "weapon" },
    { name: "M3 Grease Gun", price: 200, id: "m3", type: "weapon" },
    { name: "MP5K", price: 300, id: "mp5k", type: "weapon" },
    { name: "MP7 Submachine Gun", price: 350, id: "mp7", type: "weapon" },
    { name: "SPAS-12 Shotgun", price: 600, id: "spas", type: "weapon" },
    { name: "Remington M870", price: 1135, id: "m870", type: "weapon" },
    { name: "AK47", price: 825, id: "ak", type: "weapon" },
    { name: "SIG MCX", price: 990, id: "sigmcx", type: "weapon" },
    { name: "Mini 14", price: 800, id: "m14", type: "weapon" },
    { name: ".357 Revolver", price: 780, id: "357", type: "weapon" },
    { name: "M60 Machine Gun", price: 1500, id: "m60", type: "weapon" },
    { name: "Mosin-Nagant", price: 1375, id: "mosin", type: "weapon" },
    { name: "AR2 Pulse Rifle", price: 6000, id: "ar2", type: "weapon" },

    // Ammo
    { name: "Pistol Ammunition", price: 100, id: "pistolammo", type: "ammo" },
    { name: "4.6 Ammunition", price: 150, id: "46ammo", type: "ammo" },
    { name: ".45 ACP Ammunition", price: 150, id: "45acp", type: "ammo" },
    { name: "5.56 Ammunition", price: 220, id: "556ammo", type: "ammo" },
    { name: "12 Gauge", price: 250, id: "12gauge", type: "ammo" },
    { name: ".357 Ammunition", price: 250, id: "357ammo", type: "ammo" },
    { name: "7.62 Ammunition", price: 220, id: "762ammo", type: "ammo" },
    { name: "AR2 Ammunition", price: 2500, id: "ar2ammo", type: "ammo" },

    // Misc
    { name: "OTA Vest", price: 850, id: "otavest", type: "misc" },
    { name: "Tier Two Armor", price: 200, id: "tiertwoarmor", type: "misc" },
    { name: "Mk III Helmet", price: 650, id: "mk3helmet", type: "misc" },
    { name: "IED", price: 6500, id: "ied", type: "misc" },
    { name: "Hunting Scope", price: 400, id: "huntingscope", type: "misc" },
    { name: "Combat Gasmask", price: 50, id: "combatmask", type: "misc" },
    { name: "M40 Gasmask", price: 50, id: "m40", type: "misc" },
    { name: "Molotov", price: 300, id: "molotov", type: "misc" },
    { name: "Face Wrap", price: 50, id: "facewrap", type: "misc" },
    { name: "Padded Pants", price: 125, id: "paddedpants", type: "misc" },
    { name: "Beanie", price: 30, id: "beanie", type: "misc" }
)

ItemList.forEach( i => ItemMap.set(i.id, i) );