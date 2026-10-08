# Hash Tables

Imagine you are working in a massive library that holds millions of books. If you need to find a specific title and you have no idea where it is, you might have to walk down every single aisle, checking every shelf one by one. This is essentially what happens when you search through an unordered list. Even if you use a stack or a queue, you are still bound by the order of your items. You have to move through the data to get to what you need. But what if you could snap your fingers and instantly know exactly which shelf holds your book? That is the magic of a hash table.

A hash table is a data structure designed for speed. It allows us to associate a key, like a person's name or a product identification number, with a specific value, like their phone number or inventory count. Instead of searching through a long line of data, the hash table uses a mathematical process to jump directly to the right location in memory. We do this using a hash function. Think of a hash function as a digital blender. You feed it a piece of information—your key—and it performs a series of calculations to spit out a number. That number represents an index, or a specific slot, in an underlying array where your data should live.

For a hash function to be effective, it must be deterministic, meaning the same key always produces the same index. It should also be fast to compute and distribute keys uniformly across the available slots to avoid clustering. If you have one hundred slots, you want your data spread evenly across them rather than piling up in just a few.

Suppose we want to store employee records using their social security numbers as keys. If we have one hundred slots, our function might take the last two digits of the number and use that as the index. When we want to look that person up later, we run their number through the same function again. It points us directly to the correct slot. In an ideal scenario, hash table lookups are described as big O of one, meaning the time it takes to find an item remains constant even if you add millions of more items. However, this is an average case. In the worst case, such as when a poor hash function causes many collisions, lookups can slow down to big O of n, where the time grows with the number of items.

The world is rarely that tidy, and collisions are inevitable. If two different keys result in the same index, we must resolve the conflict. One common approach is chaining, where each slot holds a small list. If a collision occurs, we simply add the new item to the list at that index. Another approach is open addressing. Here, if a slot is full, the algorithm searches for the next available empty slot using a pattern like linear probing, where it checks the next index, or quadratic probing, where it checks slots at increasing intervals.

As we add more data, the table becomes crowded. This is measured by the load factor, which is the ratio of stored items to the total number of slots. Once the load factor exceeds a certain threshold, performance drops significantly. To fix this, the system must resize the table by creating a larger array and rehashing every existing key into its new position. This ensures the table remains efficient.

Because of this speed, hash tables are the backbone of many tools you use every day. They power dictionaries in programming languages, which allow you to map keys to values with lightning speed. They are also essential for caches, which hold frequently accessed data so the computer does not have to retrieve it from slower main memory. One important limitation is that hash tables do not maintain any inherent order of keys. If you need to retrieve items in a specific sequence, you would need a different structure, such as a list or a tree.

The trade-off for this speed is that hash tables consume more memory than a simple list, because you must keep extra space to minimize collisions. It is a classic design choice: we trade memory to gain a massive increase in performance. While hash tables are perfect for quick lookups, they do not help us see relationships between pieces of data, such as how a parent relates to a child. To understand those structures, we must eventually look toward the branching, multi-layered world of trees.

## Key ideas

- A hash table uses a hash function to map keys to specific memory indices, providing efficient, constant-time average performance for lookups.
- A good hash function must be deterministic, fast to compute, and capable of distributing keys uniformly to minimize collisions.
- When collisions occur, they are resolved through techniques like chaining, which uses lists at each index, or open addressing, which searches for the next available slot.
- To maintain performance as the table fills, the system must monitor the load factor and periodically resize and rehash the data.
- Unlike lists or trees, hash tables do not maintain any specific order among the stored keys.
