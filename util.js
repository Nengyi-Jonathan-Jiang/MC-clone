/**@template T*/
class PriorityQueue {
    /** @param {(a:T,b:T)=>boolean} [comp] should return true if a has strictly greater priority than b @param {Iterable<T>} [values] */
    constructor(comp=(a,b)=>a<b,values) {
        this.comp = comp;
        /** @type {T[]} */
        this.values = [];
        if(values) for(let value of values) this.push(value);
    }
    /** @param {T} val */
    push(val) {
        this.values.push(val);
        let index = this.values.length - 1;
        const current = this.values[index];

        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            let parent = this.values[parentIndex];
            if (!this.comp(parent, current)) {
                this.values[parentIndex] = current;
                this.values[index] = parent;
                index = parentIndex;
            } else break;
        }
    }

    /** @returns {T} */
    pop() {
        if(this.values.length <= 1) return this.values.pop();
        const max = this.values[0];
        const end = this.values.pop();
        this.values[0] = end;

        let index = 0;
        const length = this.values.length;
        const current = this.values[0];
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            
            let leftChild, rightChild;
            let swap = null;
            if (leftChildIndex < length) {
                leftChild = this.values[leftChildIndex];
                if (this.comp(leftChild, current)) swap = leftChildIndex;
            }
            if (rightChildIndex < length) {
                rightChild = this.values[rightChildIndex];
                if (
                    (swap === null && this.comp(rightChild,current)) ||
                    (swap !== null && this.comp(rightChild,leftChild))
                )
                swap = rightChildIndex;
            }

            if (swap === null) break;
            this.values[index] = this.values[swap];
            this.values[swap] = current;
            index = swap;
        }
        return max;
    }

    /** @returns {boolean} */
    empty(){
        return this.values.length == 0;
    }
}