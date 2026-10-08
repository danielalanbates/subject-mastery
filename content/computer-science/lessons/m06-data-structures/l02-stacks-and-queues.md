# Stacks and Queues

Imagine you are standing in a cafeteria, watching a spring-loaded dispenser holding a tall column of clean, white plates. When a student needs a dish, they take the one right at the very top. When a staff member replenishes the supply, they place new plates on top of the existing ones. You would never reach into the middle of that column to pull out a plate, and you certainly would not take the one from the bottom. This physical arrangement is the perfect analogy for a fundamental data structure known as a stack.

In computer science, stacks and queues are abstract data types. An abstract data type defines the expected behavior of a structure, such as how to add or remove items, without specifying the underlying technical implementation. Whether you build these using arrays or other structures, the logical behavior remains consistent.

A stack follows a principle called last in, first out. This means the very last item you added to the stack is always the first one to be removed. We call the action of adding an item pushing, and the action of removing an item popping. A stack also allows you to look at the top element without removing it, which is often called peeking. Because you only interact with the top, a stack is an efficient way to keep track of processes that need to be reversed or nested.

Think about the undo button in your word processor. When you type a word, change a font, or delete a sentence, the software pushes each of those actions onto a stack. If you press undo, the computer pops the most recent action off the top and reverses it. If you press undo again, it pops the next most recent action. This ensures that your changes are rolled back in the exact reverse order of how you performed them. The stack structure makes this possible without the computer having to scan through your entire document history.

Now, contrast this with a different kind of organization you encounter when waiting in line at a grocery store. In this scenario, the first person to join the line is the first person to be served. This is called a queue, and it operates on a first in, first out principle. While the stack is about the most recent activity, the queue is about fairness and the order of arrival.

In computing, the queue is essential for managing resources shared among many tasks. Consider a shared office printer. Multiple computers on a network might send documents to that printer at the same time. The printer cannot handle five documents simultaneously, so it places them into a print queue. The first request that arrives is the first one processed. Once that job is finished, the printer moves on to the second request. Just as a stack has a peek operation, a queue supports an operation often called front, which allows you to look at the element at the beginning of the line without removing it. If the printer used a stack instead, the person who sent their document last would always get their pages printed first, leaving early users waiting indefinitely. By using a queue, the system ensures that every request is handled in the order it was received.

Both stacks and queues are specialized ways of organizing data that prioritize specific access patterns over the flexibility of a list. When you are designing software, choosing between them depends on your goals. If you need to keep track of a path so you can retrace your steps, you use a stack. If you need to manage a sequence of events where order matters, you use a queue. By limiting how we add and remove data, we make these operations predictable and efficient, because the computer does not have to search through a collection to find the right item.

These structures are the building blocks for complex systems. Sometimes, data must be organized to allow us to find specific information almost instantly, even when we have millions of entries. In our next lesson, we will examine how we can use a technique involving keys to map data directly to a location in main memory.

## Key ideas

- Stacks and queues are abstract data types that define specific behaviors for data storage and retrieval without dictating their internal implementation.
- A stack follows the last in, first out principle and supports pushing, popping, and peeking at the top element.
- A queue follows the first in, first out principle and supports adding to the back, removing from the front, and checking the front element.
- Stacks are ideal for reversing operations, such as undoing actions in software, while queues are essential for managing shared resources in the order they arrive.
- By restricting access to only the ends of the structure, stacks and queues provide highly efficient and predictable performance for specific data-handling tasks.
