import { reactive, onMounted, onUnmounted, nextTick } from 'vue'
// import type { UnwrapRef } from 'vue'; // Not directly used, but good to be aware of for reactive types

interface ContextMenuState<T = any> {
  visible: boolean
  x: number
  y: number
  shortcut: T | null
}

export function useContextMenu<T = any>() {
  const contextMenu = reactive<ContextMenuState<T>>({
    visible: false,
    x: 0,
    y: 0,
    shortcut: null, // Initializing with null for T | null is correct
  })

  const openContextMenu = (event: MouseEvent, item: T) => {
    contextMenu.x = event.clientX + 1;
    contextMenu.y = event.clientY + 1;
    contextMenu.visible = true;
    contextMenu.shortcut = item as any; // Assigning T to a T | null property is type-safe


    // 假设 cubicBezier 函数已在别处定义或从之前的代码中复制代码如下：
    // (请确保您已包含了之前版本中提供的 cubicBezier 函数定义)
    const cubicBezier = (t: number, p1x: number, p1y: number, p2x: number, p2y: number): number => {
      function A(aA1: number, aA2: number) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
      function B(aA1: number, aA2: number) { return 3.0 * aA2 - 6.0 * aA1; }
      function C(aA1: number) { return 3.0 * aA1; }

      function calcBezier(aT: number, aA1: number, aA2: number) {
        return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
      }

      function getSlope(aT: number, aA1: number, aA2: number) {
        return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
      }

      function newtonRaphsonIterate(aX: number, aGuessT: number, mX1: number, mX2: number) {
        for (let i = 0; i < 4; ++i) {
          const currentSlope = getSlope(aGuessT, mX1, mX2);
          if (currentSlope === 0.0) return aGuessT;
          const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
          aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
      }

      if (p1x === p1y && p2x === p2y) return t; // linear
      if (t === 0) return 0;
      if (t === 1) return 1;

      let aGuessT = t;
      aGuessT = newtonRaphsonIterate(t, aGuessT, p1x, p2x);
      return calcBezier(aGuessT, p1y, p2y);
    };


    nextTick(() => {
      // const listenerElement = event.currentTarget as HTMLElement | null;
      // if (listenerElement && typeof listenerElement.blur === 'function') {
      //   listenerElement.blur(); void listenerElement.offsetHeight;
      //   listenerElement.style.setProperty('background-color', 'transparent', 'important');
      //   console.log(listenerElement);
      // }

      const contextMenuElement = document.querySelector('.context-menu-content') as HTMLElement;
      if (contextMenuElement) {
        const bezierP1x = 0.17;
        const bezierP1y = 0.84;
        const bezierP2x = 0.44;
        const bezierP2y = 1;

        // 定义坐标点的数据结构
        interface ICoordinate {
          value: number;
          unit: string;
        }

        interface IClipPathPoint {
          x: ICoordinate;
          y: ICoordinate;
        }

        // 动画阶段1的参数
        const durationPhase1 = 275; // ms
        const startTransformYPhase1 = -50; // px
        const endTransformYPhase1 = 0; // px

        const clipPathPhase1Start: IClipPathPoint[] = [
          { x: { value: -20, unit: '%' }, y: { value: -startTransformYPhase1, unit: 'px' } },
          { x: { value: 120, unit: '%' }, y: { value: -startTransformYPhase1, unit: 'px' } },
          { x: { value: 120, unit: '%' }, y: { value: 120, unit: '%' } },
          { x: { value: -20, unit: '%' }, y: { value: 120, unit: '%' } }
        ];

        // 阶段1的结束状态，同时也是阶段2的开始状态
        const clipPathPhase1End_Phase2Start: IClipPathPoint[] = [
          { x: { value: -20, unit: '%' }, y: { value: 0, unit: 'px' } }, // -0px 实际上是 0px
          { x: { value: 120, unit: '%' }, y: { value: 0, unit: 'px' } },
          { x: { value: 120, unit: '%' }, y: { value: 120, unit: '%' } },
          { x: { value: -20, unit: '%' }, y: { value: 120, unit: '%' } }
        ];

        // 动画阶段2的参数
        const durationPhase2 = 150; // ms (第二阶段线性动画的持续时间，可调整)
        // 阶段2的结束状态 (clip-path 的最终目标状态)
        const clipPathPhase2End: IClipPathPoint[] = [
          { x: { value: -20, unit: '%' }, y: { value: -10, unit: 'px' } },
          { x: { value: 120, unit: '%' }, y: { value: -10, unit: 'px' } },
          { x: { value: 120, unit: '%' }, y: { value: 120, unit: '%' } },
          { x: { value: -20, unit: '%' }, y: { value: 120, unit: '%' } }
        ];

        // 辅助函数：格式化 clip-path 字符串
        const formatClipPathToString = (points: IClipPathPoint[]): string =>
          `polygon(${points.map(p => `${p.x.value}${p.x.unit} ${p.y.value}${p.y.unit}`).join(', ')})`;

        // 辅助函数：插值 clip-path 点
        const interpolateClipPathPoints = (
          startPoints: IClipPathPoint[],
          endPoints: IClipPathPoint[],
          progress: number
        ): IClipPathPoint[] => {
          return startPoints.map((startPoint, index) => {
            const endPoint = endPoints[index];
            const currentXValue = startPoint.x.value + (endPoint.x.value - startPoint.x.value) * progress;
            const currentYValue = startPoint.y.value + (endPoint.y.value - startPoint.y.value) * progress;
            return {
              x: { value: currentXValue, unit: startPoint.x.unit }, // 单位保持不变
              y: { value: currentYValue, unit: startPoint.y.unit }  // 单位保持不变
            };
          });
        };


        // 1. 设置初始状态 (无过渡)
        contextMenuElement.style.transition = 'none';
        contextMenuElement.style.transform = `translateY(${startTransformYPhase1}px)`;
        contextMenuElement.style.clipPath = formatClipPathToString(clipPathPhase1Start);
        contextMenuElement.style.overflow = 'hidden';

        let startTimePhase1: number | null = null;

        // 动画阶段1：transformY 和 clipPath 使用贝塞尔曲线
        const animatePhase1 = (timestamp: number) => {
          if (!startTimePhase1) {
            startTimePhase1 = timestamp;
          }

          const elapsedTime = timestamp - startTimePhase1;
          const progress = Math.min(elapsedTime / durationPhase1, 1);
          const easedProgress = cubicBezier(progress, bezierP1x, bezierP1y, bezierP2x, bezierP2y);

          // 计算当前 transformY
          const currentTransformY = startTransformYPhase1 + (endTransformYPhase1 - startTransformYPhase1) * easedProgress;
          contextMenuElement.style.transform = `translateY(${currentTransformY}px)`;

          // 计算当前 clipPath
          const currentClipPoints = interpolateClipPathPoints(clipPathPhase1Start, clipPathPhase1End_Phase2Start, easedProgress);
          contextMenuElement.style.clipPath = formatClipPathToString(currentClipPoints);

          if (progress < 1) {
            requestAnimationFrame(animatePhase1);
          } else {
            // 阶段1结束，确保最终状态
            contextMenuElement.style.transform = `translateY(${endTransformYPhase1}px)`;
            contextMenuElement.style.clipPath = formatClipPathToString(clipPathPhase1End_Phase2Start);
            // 启动阶段2动画
            requestAnimationFrame(animatePhase2);
          }
        };

        let startTimePhase2: number | null = null;

        // 动画阶段2：仅 clipPath 进行线性动画
        const animatePhase2 = (timestamp: number) => {
          if (!startTimePhase2) {
            startTimePhase2 = timestamp;
          }

          const elapsedTime = timestamp - startTimePhase2;
          const progress = Math.min(elapsedTime / durationPhase2, 1);
          // 线性进度 (easedProgress = progress)

          // 计算当前 clipPath (从 Phase1End_Phase2Start 到 Phase2End)
          const currentClipPoints = interpolateClipPathPoints(clipPathPhase1End_Phase2Start, clipPathPhase2End, progress); // 使用线性 progress
          contextMenuElement.style.clipPath = formatClipPathToString(currentClipPoints);
          // transformY 保持在 endTransformYPhase1 (已在 animatePhase1 结束时设置)

          if (progress < 1) {
            requestAnimationFrame(animatePhase2);
          } else {
            // 阶段2结束，确保最终状态
            contextMenuElement.style.clipPath = formatClipPathToString(clipPathPhase2End);
            // 可选：清理，例如 contextMenuElement.style.overflow = 'visible';
          }
        };

        // 强制浏览器回流，以确保初始样式已应用
        void contextMenuElement.offsetHeight;

        // 启动动画阶段1
        requestAnimationFrame(animatePhase1);
      }
    });
  };

  const closeContextMenu = () => {
    contextMenu.visible = false
    contextMenu.shortcut = null
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (contextMenu.visible) {
      // A more robust check could involve checking if event.target is outside the context menu element
      // For simplicity now, any click outside closes it if not handled by menu item click itself.
      const target = event.target as HTMLElement
      if (!target.closest('.context-menu-content')) {
        // Assuming context menu has this class
        closeContextMenu()
      }
    }
  }

  onMounted(() => {
    window.addEventListener('mousedown', handleClickOutside, true) // Use capture phase
    window.addEventListener(
      'contextmenu',
      (e) => {
        // Close if right-clicking outside of a trigger and not on the menu itself
        const target = e.target as HTMLElement
        if (
          contextMenu.visible &&
          !target.closest('.context-menu-trigger') &&
          !target.closest('.context-menu-content')
        ) {
          closeContextMenu()
        }
      },
      true,
    ) // Use capture phase
  })

  onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside, true)
    window.removeEventListener('contextmenu', closeContextMenu, true) // Simplified removal
  })

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  }
}
