// Maquette par défaut pour un projet qui n'a pas encore son modèle 3D.
import { THREE, mat, box, rbox, cyl, at, grp, dyn, plate, led } from '../kit.js';

export default function generic(ctx) {
  const root = grp(plate(8, 6));
  const alu = mat('alu');
  // Châssis en profilés.
  for (const [x, z] of [[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]]) root.add(at(box(0.14, 2.6, 0.14, alu), x, 1.3, z));
  for (const y of [0.07, 2.53]) {
    for (const z of [-1.2, 1.2]) root.add(at(box(3.34, 0.14, 0.14, alu), 0, y, z));
    for (const x of [-1.6, 1.6]) root.add(at(box(0.14, 0.14, 2.54, alu), x, y, 0));
  }
  root.add(at(rbox(2.2, 0.08, 1.5, mat('pcb'), 0.03), 0, 0.5, 0), at(rbox(0.7, 0.16, 0.7, mat('black'), 0.03), -0.3, 0.62, 0));
  // Engrenages en mouvement.
  const gear = (r, teeth, m) => {
    const g = dyn(grp(cyl(r, 0.18, m, 32)));
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      g.add(at(box(0.16, 0.18, 0.16, m), Math.cos(a) * (r + 0.05), 0, Math.sin(a) * (r + 0.05), 0, -a, 0));
    }
    return g;
  };
  const g1 = at(gear(0.62, 14, mat('orange')), -0.45, 1.55, 0, Math.PI / 2);
  const g2 = at(gear(0.4, 9, mat('steel')), 0.67, 1.55, 0, Math.PI / 2);
  const lamp = at(led(0x35e07d, 0.09), 0.75, 0.62, 0.45);
  root.add(g1, g2, lamp);
  return {
    group: root,
    foot: [8, 6],
    height: 2.7,
    update(dt, t) {
      g1.rotation.y = t * 0.9;
      g2.rotation.y = -t * 0.9 * (14 / 9) + 0.2;
      lamp.userData.set(Math.sin(t * 3) > 0);
    },
  };
}
