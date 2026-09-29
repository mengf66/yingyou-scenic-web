<template>
  <section class="panel" :class="{ flat }">
    <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
    <header v-if="title" class="panel-head">
      <span class="seal"></span>
      <h3>{{ title }}</h3>
      <small v-if="sub">{{ sub }}</small>
      <div class="extra"><slot name="extra" /></div>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
/** 大屏面板：半透明靛蓝底、鎏金角花、楷体标题 */
defineProps({
  title: String,
  sub: String,
  flat: Boolean
})
</script>


<style scoped>
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  padding: 12px 14px 10px;
  background:
    linear-gradient(180deg, rgba(217, 179, 106, 0.07), transparent 42px),
    linear-gradient(180deg, rgba(20, 36, 74, 0.8) 0%, rgba(12, 22, 50, 0.84) 100%);
  border: 1px solid rgba(217, 179, 106, 0.2);
  border-radius: 2px;
  box-shadow:
    inset 0 0 0 3px rgba(11, 21, 48, 0.4),
    inset 0 0 0 4px rgba(217, 179, 106, 0.07),
    inset 0 0 36px rgba(217, 179, 106, 0.05),
    0 8px 22px rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.panel:hover {
  border-color: rgba(217, 179, 106, 0.38);
  box-shadow:
    inset 0 0 0 3px rgba(11, 21, 48, 0.4),
    inset 0 0 0 4px rgba(217, 179, 106, 0.12),
    inset 0 0 36px rgba(217, 179, 106, 0.08),
    0 10px 26px rgba(0, 0, 0, 0.35);
}
.panel.flat {
  background: rgba(19, 36, 74, 0.45);
}
/* 鎏金角花 */
.corner {
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;
}
.tl { left: -3px; top: -3px; background: var(--corner-tl-light) center / contain no-repeat; }
.tr { right: -3px; top: -3px; background: var(--corner-tr-light) center / contain no-repeat; }
.bl { left: -3px; bottom: -3px; background: var(--corner-bl-light) center / contain no-repeat; }
.br { right: -3px; bottom: -3px; background: var(--corner-br-light) center / contain no-repeat; }

.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-bottom: 8px;
  margin-bottom: 6px;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, rgba(217, 179, 106, 0.6), rgba(217, 179, 106, 0.05) 70%) 1;
}
/* 标题前的鎏金菱印 */
.seal {
  position: relative;
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  margin: 0 3px 0 2px;
  transform: rotate(45deg);
  border: 1px solid var(--jin-light);
  box-shadow: 0 0 6px rgba(217, 179, 106, 0.6);
}
.seal::after {
  content: '';
  position: absolute;
  inset: 2px;
  background: var(--jin-light);
}
h3 {
  margin: 0;
  font-family: var(--font-title);
  font-size: 17px;
  font-weight: normal;
  letter-spacing: 2px;
  white-space: nowrap;
  background: linear-gradient(180deg, #fff3d6, #e8cf94 70%, #d2ad66);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
small {
  overflow: hidden;
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--screen-text-2);
}
.extra {
  margin-left: auto;
  flex-shrink: 0;
}
.panel-body {
  position: relative;
  flex: 1;
  min-height: 0;
}
</style>
