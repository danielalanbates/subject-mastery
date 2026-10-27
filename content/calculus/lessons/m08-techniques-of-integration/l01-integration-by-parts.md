# Integration by Parts

Imagine you are trying to find the area under a curve, and the function you are given is not a simple sum or a basic composition, but a product of two entirely different kinds of functions. Back when we studied growth and decay, or found areas between curves, we relied on antidifferentiation rules that handled neat, straightforward expressions. But what happens when you face an integral like the integral of x times the natural logarithm of x, with respect to x? Substitution does not help here because the derivative of the natural logarithm of x does not cancel out the x neatly. We need a brand new strategy, a method designed precisely for products, and that strategy is called integration by parts.

The development of calculus in the seventeenth century brought forth this powerful technique, though it also sparked a bitter priority dispute between Isaac Newton and Gottfried Wilhelm Leibniz over who invented calculus first. Each mathematician introduced distinct notation that shaped how we write mathematics today. Leibniz introduced the long stylized s for the integral sign and the notation d x to represent an infinitesimal change, while Newton used dot notation above variables to represent derivatives.

Integration by parts is the integral version of the product rule for differentiation. Remember from our earlier rules that the derivative of a product of two functions, let us call them u and v, is equal to the first function u times the derivative of the second function, plus the second function v times the derivative of the first function. If we take that product rule equation and integrate every term with respect to x, a wonderful transformation occurs. We can rearrange the resulting equation to isolate one of the product terms on one side. This gives us the integration by parts formula.

Stated in words, the integral of u d v is equal to u times v minus the integral of v d u, where d v and d u represent the differentials of our chosen functions. The entire trick to this method lies in choosing the right parts. When you look at an integrand that is a product, you must split it into two pieces. One piece becomes u, and you will differentiate it to find d u, which usually simplifies things. The other piece becomes d v, and you must be able to integrate it to find v without too much trouble.

Let us watch this happen with a concrete example. Suppose we want to evaluate the integral of x times the natural logarithm of x, with respect to x. If we choose our function u to be the natural logarithm of x, its derivative d u is one over x, d x, which is wonderfully simple. That leaves the remaining part, x d x, to be our d v. Integrating x gives us our function v, which is one half of x squared. Now we apply our integration by parts formula.

We multiply u and v together, giving us one half of x squared times the natural logarithm of x. From that, we must subtract the integral of v d u. That new integral is the integral of one half of x squared times one over x, with respect to x. Notice how the x terms simplify inside that new integral. One factor of x cancels, leaving us with just one half of x, with respect to x. That is a basic power rule integral we can solve instantly. The antiderivative of one half of x is one fourth of x squared.

So our complete result is one half of x squared times the natural logarithm of x minus one fourth of x squared, plus the constant c. To be entirely confident in our answer, we can check our work by differentiating our final result. If we take the derivative of this expression using the product rule on the first term and the power rule on the second term, the result simplifies right back down to our original integrand, x times the natural logarithm of x.

Sometimes, a single application of integration by parts is not enough to finish the job. If you encounter an integral like the integral of x squared times the exponential of x, with respect to x, you will need to apply the formula twice. Each time you differentiate the polynomial part, its power drops by one, eventually turning into a constant that you can integrate easily.

As we move forward into our next lesson, we will build directly upon these algebraic skills to explore trigonometric integrals and trigonometric substitution, unlocking even more complex forms.

## Key ideas
- Integration by parts is the integral equivalent of the product rule for differentiation, developed during the era of the bitter priority dispute between Isaac Newton and Gottfried Wilhelm Leibniz.
- Leibniz introduced the integral sign and the d x notation, while Newton used dot notation for rates of change.
- The integration by parts formula states that the integral of u d v equals u times v minus the integral of v d u.
- Successful application of the method depends on carefully splitting the integrand into a part to differentiate and a part to integrate.
- Some complex integrals require applying the integration by parts formula multiple times until the remaining integral becomes straightforward.
