# Inverse Trigonometric Functions

Imagine you are standing on a hill, looking at a distant landmark. You know your height above the ground, and you know the horizontal distance to the landmark. To aim a camera or a telescope precisely, you need to know the angle of your gaze. In our previous study, we explored how sine and cosine functions oscillate back and forth forever. We learned that for any given angle, there is exactly one output value. But what if we want to reverse that process? What if we have a ratio, such as one half, and we need to find the angle that produced it? This is the domain of inverse trigonometric functions.

If you recall our discussion on functions, an inverse function effectively undoes the work of the original. It takes an output and maps it back to the original input. However, there is a hurdle. The sine function is periodic. It hits the value of one half at thirty degrees, one hundred fifty degrees, three hundred ninety degrees, and infinitely many other points. Because the original function is not one to one, it fails the horizontal line test. To create an inverse that is a function, we must restrict the domain of the original so that it becomes one to one. Then, its inverse will pass the vertical line test.

For the sine function, we restrict the angle to the interval from negative ninety degrees to ninety degrees, including both endpoints. Within this window, the sine value climbs steadily from negative one to one. Because of this restriction, we define the inverse sine function, written as arc sine. If the sine of an angle is one half, the arc sine of one half returns thirty degrees. It ignores all other possibilities and gives us the principal value. The domain of arc sine is every number from negative one to one, inclusive.

The cosine function requires a different restriction. If we used the same interval as sine, we would get duplicate values because of symmetry. Instead, we restrict the cosine function to the interval from zero degrees to one hundred eighty degrees, inclusive. In this range, the cosine value falls steadily from one down to negative one. Consequently, the arc cosine function will always provide an angle between zero and one hundred eighty degrees. The domain of arc cosine is also every number from negative one to one, inclusive.

The tangent function has vertical asymptotes where it is undefined. We restrict the tangent function to the open interval between negative ninety degrees and ninety degrees. This allows the arc tangent function to map any real number to an angle strictly between negative ninety and ninety degrees. If you calculate the arc tangent of one, you get forty-five degrees.

It is vital to note that the notation arc sine, arc cosine, and arc tangent denotes the inverse function, not the reciprocal. These are not the same as cosecant, secant, or cotangent. Furthermore, we must be careful with composition. The sine of the arc sine of x is simply x, provided that x is between negative one and one. However, the arc sine of the sine of an angle is only equal to that angle if the angle itself is within the restricted range of negative ninety to ninety degrees.

Let us walk through an example. Suppose a ramp rises three feet over a horizontal distance of three feet. The ratio of the opposite side to the adjacent side is three divided by three, which is one. To find the angle, you calculate the arc tangent of one, which is forty-five degrees. If you need to find all possible angles that satisfy an equation, you must account for the periodicity. For sine, if the arc sine of y equals an angle, the full set of solutions is that angle plus any integer multiple of three hundred sixty degrees, or one hundred eighty degrees minus that angle plus any integer multiple of three hundred sixty degrees.

Understanding these inverse operations allows us to move fluidly between side lengths and angles. Just remember that your calculator only provides the principal value. If your physical situation requires an angle in a different quadrant, you must use your knowledge of the unit circle to adjust that value accordingly.

## Key ideas

- We restrict the domains of trigonometric functions to make them one to one, which allows their inverses to be well-defined functions.
- The domain of arc sine and arc cosine is the interval from negative one to one, while the domain of arc tangent is all real numbers.
- The notation arc sine, arc cosine, and arc tangent refers to inverse functions, not the reciprocal functions cosecant, secant, or cotangent.
- Composition of a function and its inverse returns the original input only when that input lies within the restricted domain or range.
- To find all solutions to a trigonometric equation, find every solution in one cycle, starting from the principal value, then add integer multiples of the function's period to each.
