import { CourseSample } from '../types';

export const COURSE_SAMPLES: CourseSample[] = [
  {
    id: 'neurobio-101',
    title: 'Neurobiology: Action Potentials & Synaptic Transmission',
    subject: 'Medicine & Biological Sciences',
    icon: 'Brain',
    difficulty: 'Upper Undergraduate',
    description: 'Explores how neurons transmit electrochemical signals across synaptic clefts via voltage-gated ion channels and neurotransmitters.',
    fullText: `Chapter 4: Neuronal Signaling & Synaptic Physiology

4.1 The Resting Membrane Potential and Ion Distribution
At rest, a neuron maintains an asymmetric distribution of inorganic ions across its plasma membrane. The intracellular environment possesses a high concentration of potassium (K+) ions and impermeant organic anions (A-), whereas the extracellular fluid is rich in sodium (Na+) and chloride (Cl-) ions. This ionic gradient is sustained by the ATP-dependent Na+/K+ ATPase pump, which extrudes three Na+ ions for every two K+ ions imported. The resulting resting potential typically measures approximately -70 millivolts (mV).

4.2 Generation of the Action Potential
When a depolarizing stimulus raises the membrane potential past the threshold voltage (~ -55 mV), voltage-gated sodium channels undergo a rapid conformational change, permitting an influx of Na+ down both electrical and concentration gradients. This sudden influx causes rapid membrane depolarization peaking around +30 mV. Subsequently, Na+ channels undergo fast inactivation, while delayed rectifier voltage-gated potassium channels open, allowing K+ efflux to repolarize the cell. An transient hyperpolarization phase ensues before leak channels restore equilibrium.

4.3 Chemical Synaptic Transmission
Upon reaching the presynaptic axon terminal, the action potential triggers voltage-gated calcium channels (Ca2+) to open. Ca2+ influx mobilizes synaptic vesicles loaded with neurotransmitters (such as glutamate or acetylcholine) to undergo exocytosis at the active zone. Neurotransmitters diffuse across the ~20nm synaptic cleft and bind to ligand-gated ionotropic or metabotropic G-protein coupled receptors on the postsynaptic membrane, eliciting either Excitatory Postsynaptic Potentials (EPSPs) or Inhibitory Postsynaptic Potentials (IPSPs).`
  },
  {
    id: 'quantum-202',
    title: 'Quantum Mechanics: Wave-Particle Duality & Superposition',
    subject: 'Physics',
    icon: 'Atom',
    difficulty: 'Intermediate Undergraduate',
    description: 'Demystifies Schrödinger wavefunction, double-slit experiment, quantum superposition, and measurement collapse.',
    fullText: `Unit 3: Foundational Quantum Phenomena

3.1 Wave-Particle Duality & de Broglie Hypothesis
Classical physics bifurcates physical phenomena into discrete particles with localized trajectories and continuous waves governed by field equations. In 1924, Louis de Broglie hypothesized that matter exhibits dual properties, assigning a wavelength λ = h/p (where h is Planck's constant and p is momentum) to all moving matter. This dual nature is demonstrated experimentally by electron diffraction through crystalline lattices and double-slit interference patterns formed by individual electrons over time.

3.2 Schrödinger Wave Equation & Probability Amplitudes
The state of a quantum mechanical system is encapsulated by a complex-valued wavefunction Ψ(x,t). According to the Born interpretation, the squared magnitude |Ψ(x,t)|^2 represents the probability density function of discovering the particle at spatial coordinate x at time t. The time-dependent Schrödinger equation governing this evolution is:
iħ ∂Ψ/∂t = ĤΨ

3.3 Quantum Superposition and Quantum Measurement Collapse
Prior to measurement, a quantum system exists in a linear combination or superposition of distinct physical states: |Ψ⟩ = c1|ψ1⟩ + c2|ψ2⟩. Upon interaction with a macroscopic measurement apparatus, the superposition irreversibly collapses into one of the eigenstates |ψi⟩ with probability |ci|^2. The Heisenberg Uncertainty Principle (Δx Δp ≥ ħ/2) imposes a fundamental lower limit on the simultaneous precision of conjugate observables.`
  },
  {
    id: 'macro-301',
    title: 'Macroeconomics: Inflationary Spirals & Central Bank Policy',
    subject: 'Economics & Business',
    icon: 'TrendingUp',
    difficulty: 'General Undergraduate',
    description: 'Covers demand-pull inflation, cost-push inflation, open market operations, interest rate transmission, and quantitative easing.',
    fullText: `Module 5: Monetary Policy & Inflation Mechanics

5.1 Taxonomy of Inflationary Pressures
Inflation represents a sustained increase in the aggregate price level of goods and services over time. Economists categorize inflation by underlying catalysts:
1. Demand-Pull Inflation: Occurs when aggregate demand (AD = C + I + G + NX) outpaces aggregate supply (AS) near full-employment capacity, causing price bidding.
2. Cost-Push Inflation: Stems from sudden supply shocks in key inputs (e.g., energy, agricultural commodities), shifting the Short-Run Aggregate Supply (SRAS) curve upward and causing stagflation.

5.2 Central Bank Transmission Mechanisms
Central banks regulate money supply and systemic liquidity primarily through three levers:
- Open Market Operations (OMOs): Purchasing or selling government bonds to inject or absorb commercial bank reserves.
- Policy Interest Rates (e.g., Federal Funds Rate, REPO rate): Setting the benchmark interbank borrowing cost to influence commercial lending rates.
- Reserve Requirements: Dictating the fraction of deposits banks must retain in vault cash or central bank reserves.

5.3 Unconventional Policy: Quantitative Easing (QE)
When policy rates hit the Effective Lower Bound (ELB), central banks engage in Quantitative Easing—large-scale asset purchases of longer-term government and corporate securities to flatten the yield curve, lower long-term borrowing costs, and stimulate private investment.`
  },
  {
    id: 'cs-algo-210',
    title: 'Computer Science: Graph Traversal & Dijkstra\'s Algorithm',
    subject: 'Computer Science & Software',
    icon: 'Network',
    difficulty: 'Core Computer Science',
    description: 'Breaks down single-source shortest path, greedy choices, priority queues, and graph representations.',
    fullText: `Section 7: Graph Algorithms and Shortest Path Heuristics

7.1 Graph Representations and Terminology
A graph G = (V, E) consists of a set of vertices V and edges E. Edges may be directed or undirected, and weighted or unweighted. Graphs are computationally represented using:
- Adjacency Matrix: A V x V matrix where A[i][j] holds edge weights. Requires O(V^2) space complexity.
- Adjacency List: An array of linked lists or vectors storing adjacent neighbors for each vertex. Requires O(V + E) space complexity, making it optimal for sparse graphs.

7.2 Breadth-First Search (BFS) vs Depth-First Search (DFS)
Unweighted shortest path queries utilize BFS, which explores nodes layer-by-layer using a FIFO queue in O(V + E) time. DFS explores deeply down each path using LIFO execution stack or recursion, suitable for topological sorting and connected components.

7.3 Dijkstra's Single-Source Shortest Path Algorithm
Dijkstra's algorithm solves single-source shortest path problems on weighted graphs with non-negative edge weights using a greedy strategy. It maintains a distance array dist[] initialized to infinity, except dist[source] = 0, and a min-priority queue storing (distance, vertex) tuples.
In each iteration, the algorithm extracts the vertex u with minimum distance, iterates over all outgoing edges (u, v) with weight w, and performs edge relaxation:
if dist[u] + w < dist[v]:
    dist[v] = dist[u] + w
    update priority queue with (dist[v], v)

Time complexity with a Fibonacci Heap is O(E + V log V), or O((V + E) log V) with a standard Binary Min-Heap.`
  }
];
