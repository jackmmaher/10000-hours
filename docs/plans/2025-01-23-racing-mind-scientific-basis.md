# Racing Mind Eye Tracking: Scientific Basis & Engagement Methodology

## Overview

The Racing Mind practice tool uses bilateral eye movements combined with smooth pursuit tracking to reduce anxiety and calm the racing mind. This document outlines the scientific evidence supporting the methodology and the engagement metrics used.

## Scientific Foundation

### 1. Bilateral Eye Movements & Amygdala Deactivation

Research from the Journal of Neuroscience demonstrates that goal-directed horizontal eye movements transiently deactivate the amygdala:

> "Goal-directed eye movements activate a dorsal frontoparietal network and transiently deactivate the amygdala. Connectivity analyses revealed that this downregulation potentially engages a ventromedial prefrontal pathway known to be involved in cognitive regulation of emotion."
> — [de Voogd et al., 2018](https://www.jneurosci.org/content/38/40/8694)

Key findings:

- Eye movements following memory reactivation reduced spontaneous fear recovery 24 hours later
- Stronger amygdala deactivation predicted stronger reduction in subsequent fear recovery
- The mechanism works through the superior colliculus and mediodorsal thalamus sending inhibitory signals to the basolateral amygdala

### 2. EMDR Evidence Base

Eye Movement Desensitization and Reprocessing (EMDR) therapy provides extensive clinical validation:

- Over 30 published randomized controlled trials demonstrate effectiveness
- Recommended as first-line PTSD treatment by most international clinical practice guidelines
- fMRI research shows EMDR reduces hyperactivity in the amygdala and normalizes hippocampal function

Source: [State of the Science: EMDR Therapy (2024)](https://onlinelibrary.wiley.com/doi/10.1002/jts.23012)

### 3. Eye Movements & Parasympathetic Activation

Studies measuring physiological changes during eye movement therapy found:

> "Eye movements were associated with increased parasympathetic nervous system activity, that is, decreased heart rate and increased heart rate variability, decreased sympathetic nervous system activity (reflected by decreased skin conductance and increased finger temperature)."
> — [Springer Publishing](https://connect.springerpub.com/highwire_display/entity_view/node/69590/full)

Horizontal and vertical eye movements stimulate the oculomotor and abducens nerves, which can indirectly activate the vagus nerve, shifting autonomic balance toward parasympathetic dominance.

### 4. HRV & Anxiety Reduction

Heart rate variability (HRV) biofeedback research supports the connection between regulated eye movements and anxiety reduction:

- Low resting HRV is associated with anxiety disorders and decreased emotion regulation capacity
- HRV biofeedback training shows mild to moderate efficacy for anxiety reduction
- Coherent breathing patterns (which Racing Mind's oscillation frequency aligns with) improve HRV

Source: [Effects of HRV Biofeedback on Anxiety Reduction (2024)](https://pubmed.ncbi.nlm.nih.gov/38888656/)

## Implementation Parameters

Based on the research, Racing Mind uses these evidence-based parameters:

| Parameter             | Value       | Scientific Basis                                                     |
| --------------------- | ----------- | -------------------------------------------------------------------- |
| Oscillation frequency | 0.3-0.5 Hz  | Aligned with cardiac coherence/HRV resonance (Lehrer & Gevirtz 2014) |
| Speed range           | 12-22°/sec  | Within comfortable smooth pursuit range (<30°/sec threshold)         |
| Orb visual angle      | ~5.7°       | Research suggests 4-6° optimal for tracking                          |
| Glow pulse            | 0.7 Hz      | Well below 3Hz seizure threshold, calming rhythm                     |
| Session deceleration  | Eased curve | Mirrors natural settling of the nervous system                       |

## Engagement Metrics

The three engagement metrics measure therapeutic participation:

### Focus Time

**What it measures:** Total seconds where gaze stayed within 200px of the orb center.

**Why it matters:** Time spent actively tracking drives amygdala deactivation. The bilateral stimulation effect requires sustained visual engagement with the moving target.

### Engagement Percentage

**What it measures:** Focus Time / Session Duration × 100

**Why it matters:** Consistency of tracking correlates with depth of parasympathetic response. Brief tracking with frequent breaks provides less therapeutic benefit than sustained engagement.

### Best Streak

**What it measures:** Longest continuous period of unbroken focus (allowing 500ms grace for brief glances).

**Why it matters:** Sustained attention periods are when the "soft fascination" state deepens. Longer streaks indicate deeper entry into the restorative attention state.

## Threshold Rationale

The 200px focus threshold accounts for:

1. WebGazer's inherent ~100-200px accuracy on mobile devices
2. Natural lag when tracking a moving target
3. The therapeutic effect doesn't require pixel-perfect tracking—sustained general engagement is what matters

## Motion Design

### Pendulum-Like Movement

The orb follows pure sinusoidal motion with spring-based smoothing:

- Sine waves naturally decelerate at peaks (velocity = cos, which approaches 0 at extremes)
- Spring physics adds organic momentum and subtle overshoot
- Result: natural pendulum feel without artificial discontinuities

### Soft-Edge Gradient

The orb uses 24 concentric rings with quadratic alpha falloff:

- Discourages "hard" fixation; encourages peripheral awareness
- Peripheral vision activation is incompatible with high-stress states
- Promotes parasympathetic "soft gaze" response

## References

1. de Voogd, L. D., et al. (2018). Eye-Movement Intervention Enhances Extinction via Amygdala Deactivation. _Journal of Neuroscience_, 38(40), 8694-8706.

2. de Jongh, A., et al. (2024). State of the science: Eye movement desensitization and reprocessing (EMDR) therapy. _Journal of Traumatic Stress_.

3. Lehrer, P. M., & Gevirtz, R. (2014). Heart rate variability biofeedback: how and why does it work? _Frontiers in Psychology_, 5, 756.

4. Baek, J., et al. (2019). Bilateral visual stimulation suppresses the activity of basolateral amygdala. _Science Advances_.

5. Shapiro, F. (2018). _Eye Movement Desensitization and Reprocessing (EMDR) Therapy: Basic Principles, Protocols, and Procedures_ (3rd ed.). Guilford Press.
