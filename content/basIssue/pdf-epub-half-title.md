---
layout: base.11ty.js
classes:
  - half-title-page
order: 51
outputs:
  - epub
  - pdf
toc: false
permalink: '/pdf-epub-half-title/'
---

<section class="half-title">

{% if publication.short_title %}
  {{ publication.short_title | markdownify }}
{% elsif publication.title %}
  {{ publication.title | markdownify }}
{% endif %}

</section>
