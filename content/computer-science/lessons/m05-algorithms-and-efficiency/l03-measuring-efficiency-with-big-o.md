# Measuring Efficiency with Big O

Imagine you are a librarian tasked with finding a specific book in a massive library. If you search shelf by shelf, starting from the front door and checking every single volume until you find the right one, you will eventually succeed. However, the time it takes depends entirely on how many books are in the library. If the library doubles in size, your search time roughly doubles as well. But what if you could use an index card system that points you directly to the correct aisle? In that case, even if the library grows to ten times its size, your search time barely increases. In computer science, we need a way to describe this difference in performance without relying on the speed of a specific computer or the time on a stopwatch. We call this measurement big O notation.

When we talk about efficiency, we do not measure time in seconds because hardware changes. A program that runs in one second on your laptop might take ten seconds on a slower machine or a fraction of a second on a supercomputer. Instead, we count the number of fundamental operations an algorithm performs as the input size increases. We define this input size with the letter N. By focusing on how the number of steps grows in relation to N, we can predict how an algorithm will behave when it is asked to process a million items instead of ten.

Big O notation describes an upper bound on the growth rate of an algorithm's work. It is most often used to describe the worst case scenario, which tells us the maximum amount of work the algorithm might need to perform. Furthermore, this analysis is asymptotic. This means we consider how the work behaves as the input size N grows toward infinity. When we calculate this, we ignore constant factors and lower order terms. For example, if an algorithm takes two times N plus five steps, we describe it simply as big O of N. We care about the dominant term that dictates how the work scales as the data gets larger.

The simplest class of efficiency is constant time, or big O of one. This describes an operation that takes the same amount of time regardless of how much data you have. Think of accessing the first item in a list. Whether the list has five items or five billion, the computer knows exactly where the start of that list is in memory. The work does not grow as the input grows.

Next, we encounter logarithmic time, or big O of log N. This is the gold standard for searching. When you search through an ordered list by repeatedly cutting the remaining search area in half, the number of steps grows very slowly. Even if you double the number of items, you only add one extra step to your process. This is incredibly efficient for large datasets.

Linear time, or big O of N, is what we see in our library shelf search. If you have N books to check, you perform N operations. If you double the input, the work doubles. This is predictable and often acceptable, but it can become slow if the dataset is truly massive.

Sometimes, we see an algorithm perform at a level called N log N. This often occurs in efficient sorting algorithms. It is slightly slower than linear time, but it is still highly effective for large amounts of information. It essentially means that for every item we process, we perform a logarithmic number of operations.

Quadratic time, or big O of N squared, is where things start to get difficult. This happens when you have nested operations, such as comparing every item in a list to every other item in that same list. If you double the input, the work does not just double; it quadruples. As N grows, the time required quickly becomes astronomical.

Finally, we have exponential time, or big O of two to the power of N. This usually appears when an algorithm tries every possible combination of the input, such as every subset of a set of items, and it makes large inputs impractical to solve. If you add just one more item to your input, the work required doubles. Even with the fastest computers on earth, an exponential algorithm will grind to a halt once the input size reaches a modest number, like one hundred.

By understanding these classes, we can look at an algorithm and immediately grasp its scalability. We move away from asking how fast the computer is and start asking how the algorithm respects the limits of computation as our data grows. In our next session, we will apply these concepts of efficiency to look at simple sorting methods, where we will see firsthand how different approaches to organizing data lead to vastly different performance outcomes.

## Key ideas
- Big O notation describes the upper bound of an algorithm's growth rate in the worst case, ignoring constant factors and lower order terms.
- Asymptotic analysis focuses on how an algorithm's work scales as the input size N approaches infinity.
- Constant time algorithms perform the same amount of work regardless of input size, while linear time algorithms grow in direct proportion to the input.
- Logarithmic time is highly efficient because the number of steps grows very slowly even as the input size increases significantly.
- Quadratic and exponential algorithms become unmanageable quickly because the work required grows drastically with each additional piece of data.
