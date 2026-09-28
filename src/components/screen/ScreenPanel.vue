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
/** 大屏面板：靛蓝底、鎏金四角、楷体标题 */
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
  background: var(--screen-panel);
  border: 1px solid rgba(217, 179, 106, 0.18);
  border-radius: 2px;
  box-shadow: inset 0 0 30px rgba(217, 179, 106, 0.05), 0 6px 18px rgba(0, 0, 0, 0.25);
}
.panel.flat {
  background: rgba(19, 36, 74, 0.45);
}
.corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--jin);
  border-style: solid;
  border-width: 0;
  pointer-events: none;
}
.tl { left: -1px; top: -1px; border-left-width: 2px; border-top-width: 2px; }
.tr { right: -1px; top: -1px; border-right-width: 2px; border-top-width: 2px; }
.bl { left: -1px; bottom: -1px; border-left-width: 2px; border-bottom-width: 2px; }
.br { right: -1px; bottom: -1px; border-right-width: 2px; border-bottom-width: 2px; }

.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-bottom: 8px;
  margin-bottom: 6px;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, rgba(217, 179, 106, 0.55), rgba(217, 179, 106, 0.05) 70%) 1;
}
.seal {
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background: var(--jin);
  box-shadow: 0 0 6px rgba(217, 179, 106, 0.7);
}
h3 {
  margin: 0;
  font-family: var(--font-title);
  font-size: 17px;
  font-weight: normal;
  letter-spacing: 2px;
  color: var(--jin-light);
}
small {
  font-size: 11px;
  color: var(--screen-text-2);
}
.extra {
  margin-left: auto;
}
.panel-body {
  position: relative;
  flex: 1;
  min-height: 0;
}
</style>
