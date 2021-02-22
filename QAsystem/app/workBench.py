import matplotlib.pyplot as plot

time = [i for i in range(21)]
number = []
y0 = 50
for i in range(21):
    number.append(y0)
    yt = -1.2 * y0 + 198
    y0 = yt

plot.xlabel('t')
plot.ylabel('y(t)')
plot.plot(time, number)
plot.show()

