# Three Variables, Matrices and Row Reduction

Imagine you are managing a warehouse with three types of shipping crates. You know the total number of items, the total weight, and the total volume. If you have three separate equations detailing these constraints, you have a system of three linear equations. In our last lesson, we solved systems of two variables using elimination. When we scale this up to three variables, the algebra can become messy. We need a more efficient bookkeeping method. This is where matrices come in.

A matrix is a rectangular grid of numbers. We use them to strip away the variable names and focus on the coefficients and the constants. To turn a system of three equations into an augmented matrix, we write the coefficients in rows and columns, followed by a vertical boundary representing the equals sign, and then the constant values on the far right. Think of each row as shorthand for one of your original equations. By working with the matrix, we avoid writing variables repeatedly, which keeps our logic sharp.

These operations preserve the solution set because they mimic the rules of algebra. Swapping two rows is simply reordering the equations. Multiplying a row by a non-zero constant is the same as multiplying both sides of an equation by that same number. Adding a multiple of one row to another is equivalent to adding one equation to another to eliminate a variable. Because these steps do not change the underlying relationship between the variables, the solution remains identical to the original system.

Let us look at a system. Suppose our equations are: x plus y plus z equals six, x minus y plus z equals two, and two x plus y minus z equals one. To turn this into an augmented matrix, we write three rows. The first row contains one, one, one, and the constant six. The second row contains one, negative one, one, and the constant two. The third row contains two, one, negative one, and the constant one.

We use row operations to reach row-echelon form. In this state, the first column has a one at the top and zeros below it, and the second column has a one in the middle position with a zero below that. This staircase pattern of ones allows us to solve for variables using back-substitution. Alternatively, we can use Gauss-Jordan elimination to reach the reduced row-echelon form, where the left side becomes an identity matrix with ones on the diagonal and zeros everywhere else. In this form, the solution for each variable is read directly from the final column.

When solving, we encounter three possible outcomes. A unique solution occurs when we reach a final row that clearly defines each variable. If we encounter a contradiction, such as a row of zeros equaling a non-zero number, the system is inconsistent and has no solution. If we end up with a row of all zeros, the system is dependent and has infinitely many solutions.

Let us perform a row operation. To eliminate the x from the second row, subtract the first row from the second row. One minus one is zero. Negative one minus one is negative two. One minus one is zero. Two minus six is negative four. Our new second row is zero, negative two, zero, and negative four. This means negative two y equals negative four, so y equals two.

Next, eliminate x from the third row by subtracting two times the first row from the third row. Two minus two times one is zero. One minus two times one is negative one. Negative one minus two times one is negative three. One minus two times six is negative eleven. Now the third row is zero, negative one, negative three, and negative eleven. Substitute y equals two into this: negative one times two minus three z equals negative eleven. This is negative two minus three z equals negative eleven. Adding two to both sides gives negative three z equals negative nine, so z equals three. Finally, substitute y equals two and z equals three into the first equation: x plus two plus three equals six, so x equals one.

Always check your work by substituting your values back into all three original equations. For the first, one plus two plus three equals six. For the second, one minus two plus three equals two. For the third, two times one plus two minus three equals one. All equations hold true.

## Key ideas
- An augmented matrix represents a system of equations by focusing on the coefficients and constant terms while omitting the variables.
- Row operations, including swapping, scaling, and adding rows, preserve the solution set of the system.
- Systems may result in a unique solution, no solution if the system is inconsistent, or infinitely many solutions if the system is dependent.
- Reduced row-echelon form allows for the direct identification of variable values, while back-substitution is used when the matrix is in standard row-echelon form.
- Every solution must be verified by substituting the values back into all original equations to ensure accuracy.
