//Implement priorityqueue in cpp so i can compile to wasm
#include <vector>

using namespace std;

template<class T>
class PriorityQueue{
    vector<T> values;

    PriorityQueue(){/*We dont need to initialize anything*/}

public:
    void push(T val){
        vec.push(val);
        int index = values.size() - 1;

        while(index > 0) {
            int parentIndex = (index - 1) / 2;
            T parent = values[parentIndex];
            if (parent <= val) {
                values[parentIndex] = val;
                values[index] = parent;
                index = parentIndex;
            }
            else break;
        }
    }
    T pop(){
        if(values.size() == 1)
            return values.pop();
        const T max = values[0];
        const T end = values.pop();
        values[0] = end;

        int index = 0;
        const int length = values.length;
        const T current = values[0];

        while(true){
            int leftChildIndex = 2 * index + 1;
            int rightChildIndex = 2 * index + 2;
            
            T leftChild, rightChild;
            int swap = -1;

            if (leftChildIndex < length) {
                leftChild = values[leftChildIndex];
                if (leftChild > current) swap = leftChildIndex;
            }
            if (rightChildIndex < length) {
                rightChild = values[rightChildIndex];
                if ((swap === null && rightChild > current)) || (swap !== null && rightChild > leftChild)))
                    swap = rightChildIndex;
            }

            if (swap == -1) break;
            
            values[index] = values[swap];
            values[swap] = current;
            index = swap;
        }
        return max;
    }

    bool empty(){
        return values.empty();
    }
};