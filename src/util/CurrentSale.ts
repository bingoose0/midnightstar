import Item from "./Item";

export default class CurrentSale {
    items: Array<Item> = new Array<Item>;

    calculatePrice() : number {
        let hasWeapon = false

        let ammoPrice = 0
        let otherPrice = 0

        for(const key in this.items) {
            const item = this.items[key]
            if(item.type == "ammo") {
                ammoPrice += item.price
            } else if(item.type == "weapon") {
                hasWeapon = true
                otherPrice += item.price
            } else {
                otherPrice += item.price
            } 
        }

        ammoPrice = hasWeapon ? ammoPrice / 2 : ammoPrice // All ammo is half of when buying a weapon with it.

        return ammoPrice + otherPrice
    }

    itemString(): string {
        return this.items.map( o => o.name ).join(", ");
    }
    
    toJSON(): string {
        return JSON.stringify(this.items);
    }
}