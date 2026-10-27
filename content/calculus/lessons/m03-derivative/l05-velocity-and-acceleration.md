# Velocity and Acceleration

Imagine throwing a small stone straight up into the air. It climbs, slows to a complete pause for a single instant at the peak of its flight, and then speeds up as it plunges back down toward the ground. How do we describe this changing motion using mathematics? We apply derivative tools to the physical world, beginning with straight line motion.

To describe an object moving along a straight line, we start with a position function, s of t, where t represents time. This function tells us where the object is located relative to an origin. Its rate of change with respect to time tells us how fast that position is changing. In calculus, the first derivative of the position function is instantaneous velocity, written as v of t, which equals s prime of t.

Velocity carries two crucial pieces of information: magnitude and direction. A positive velocity means the object moves forward or upward; a negative velocity means it moves backward or downward. If velocity is zero, the object is momentarily at rest. It is vital to distinguish velocity from speed. Speed is simply how fast an object is moving, regardless of its direction. Mathematically, speed is the absolute value of velocity. For instance, if a car moves backward at thirty miles per hour, its velocity is negative thirty miles per hour, but its speed is positive thirty miles per hour. Speed can never be negative.

What happens when velocity itself changes over time? When you step on the gas pedal in a car, your velocity increases. The rate of change of velocity with respect to time is acceleration. Because acceleration is the derivative of velocity, it is also the second derivative of the position function, written as s double prime of t. In differential notation, this is d squared s over d t squared. Both Sir Isaac Newton and Gottfried Wilhelm Leibniz developed these concepts, using their own notations.

For a special but common case, acceleration is constant. Physics books usually print this constant with the first letter of the alphabet; here we will call it k. Working backward from the derivative, a process called antidifferentiation that we study later, the velocity function is k times t plus an initial velocity, v sub zero, and the position function is one half k t squared, plus v sub zero times t, plus an initial position, s sub zero. You can check this by differentiating: the derivative of that position is k t plus v sub zero, which is the velocity, and the derivative of the velocity is k. This formula is a cornerstone of physics for motion under constant acceleration.

Let us walk through a concrete example. Suppose a particle moves along a straight line so that its position at time t seconds is given by s of t equals t cubed minus six t squared plus nine t meters. To find the velocity at any time t, we take the first derivative of position using the power rule. The derivative of t cubed is three t squared, minus six t squared is minus twelve t, and nine t is nine. Therefore, the velocity function v of t equals three t squared minus twelve t plus nine meters per second.

Now, when is this particle at rest? An object is at rest when its velocity is zero. Setting three t squared minus twelve t plus nine equal to zero, we find that the velocity is zero at t equals one second and at t equals three seconds. At these moments, the particle momentarily stops before reversing direction. These points, where velocity is zero and changes sign, are critical points of the position function, indicating a local maximum or minimum. For instance, between one second and three seconds, the velocity is negative, meaning the particle moves backward.

Next, we find acceleration by differentiating the velocity function. The derivative of three t squared minus twelve t plus nine yields six t minus twelve meters per second squared. An object speeds up when its velocity and acceleration have the same sign, and slows down when they have opposite signs. For example, at t equals zero seconds, positive velocity and negative acceleration mean the particle is slowing down. At t equals four seconds, both velocity and acceleration are positive, so the particle is speeding up.

Physical systems often involve repeating, periodic motion, such as a swinging pendulum or a vibrating spring. To model those oscillating paths, we need derivatives of periodic functions, bringing us straight to our next topic: trigonometric derivatives.

## Key ideas

- Instantaneous velocity, the first derivative of position, represents both speed and direction, while speed is its absolute value.
- Acceleration is the derivative of velocity and the second derivative of position with respect to time.
- When velocity is zero and changes sign, the position function reaches a local maximum or minimum.
- For constant acceleration, the position function is given by the kinematic formula: position equals one half times the constant acceleration times t squared, plus initial velocity times t, plus initial position.
- An object speeds up when its velocity and acceleration share the same sign, and slows down when they have opposite signs.
