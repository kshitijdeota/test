---
layout: page
order: 50
classes:
  - copyright-page
outputs:
  - epub
  - pdf
toc: false
permalink: '/pdf-epub-copyright/'
---

{% copyright %}

{% if publication.identifier.isbn %}
ISBN: {{ publication.identifier.isbn }}
{% endif %}
