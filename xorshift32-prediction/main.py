import time

class XorShift():
    def __init__(self, seed):
        self.s = seed

    # python の int 型は無制限なので 32bit に切り詰める
    def mask(self, x):
        return x & 0xffffffff

    def rand(self):
        # https://ja.wikipedia.org/wiki/Xorshift の xorshift32
        self.s = self.mask(self.s ^ (self.s << 13))
        self.s = self.mask(self.s ^ (self.s >> 17))
        self.s = self.mask(self.s ^ (self.s << 5))
        
        # 出力は内部状態変数 s の下位 16bit
        return self.s & 0xffff

rng = XorShift(777)

sequence = [rng.rand() for i in range(10)]

# [17433, 63802, 48521, 8888, 60923, 59364, 53581, 56036, 61202, 34977]
print("Randoms", sequence)

# 7649 （これを予想する）
print(f"Next random is {rng.rand()}")  


###################################
# 総当りで予想する
###################################
st = time.time()
rng = XorShift(1)
samples = [rng.rand() for i in range(len(sequence))]
while samples != sequence:
    samples = [*samples[1:], rng.rand()]
print(f"Predict: {rng.rand()} ({time.time() - st}s)")
# Predict: 7649 (2990.971052646637s)


###################################
# Z3 を使用して予想する
###################################
import z3

st = time.time()
solver = z3.Solver()

s = z3.BitVec("s", 32)
for i in sequence:
    s = s ^ (s << 13)
    s = s ^ z3.LShR(s, 17)
    s = s ^ (s << 5)
    solver.add(s & 0xffff == i)

if solver.check() != z3.sat:
    raise Exception("unsat !!!")

model = solver.model()
states = {str(s): model[s] for s in model}

seed = states["s"].as_long()

rng = XorShift(seed)
for _ in range(len(sequence)):
    rng.rand()

print(f"Predict: {rng.rand()} ({time.time() - st}s)")
print("Predicted initial seed", seed)
# Predicted initial seed 777
# Predict: 7649 (0.06324553489685059s)
