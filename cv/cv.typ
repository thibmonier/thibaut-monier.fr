// CV public de Thibaut Monier (US-007, ADR-0005). Aucune donnée en dur : tout vient du JSON assemblé par
// src/lib/cv-data.ts et passé par `--input data=...`. Compilation : `make cv` (scripts/build-cv.ts).
#let data = json(bytes(sys.inputs.data))
#let color(name) = rgb(data.theme.colors.at(name))
#let date-parts = data.meta.generatedAt.split("-").map(int)

#set document(
  title: data.meta.title,
  author: data.meta.author,
  date: datetime(year: date-parts.at(0), month: date-parts.at(1), day: date-parts.at(2)),
)
#set page(paper: "a4", margin: (x: 17mm, top: 15mm, bottom: 14mm))
#set text(font: data.theme.font, lang: "fr", size: 9.6pt, fill: color("fg"), hyphenate: false)
#set par(leading: 0.62em, spacing: 0.7em, justify: false)
#set list(indent: 0pt, body-indent: 0.6em, spacing: 0.5em, marker: text(fill: color("accent"))[•])
#show link: set text(fill: color("accent"))

#show heading.where(level: 1): it => block(below: 0.35em, text(size: 25pt, weight: "bold", it.body))
#show heading.where(level: 2): it => block(above: 1.1em, below: 0.6em, width: 100%, {
  text(size: 8.8pt, weight: "bold", fill: color("accent"), tracking: 0.08em, upper(it.body))
  v(-0.2em)
  line(length: 100%, stroke: 0.6pt + color("border"))
})
#show heading.where(level: 3): it => text(size: 10.6pt, weight: "semibold", it.body)

= #data.header.name

#text(size: 12pt, weight: "medium", fill: color("accent"))[#data.header.title]

#text(fill: color("muted"))[#data.header.tagline]

#text(fill: color("muted"))[#data.header.location]
#for l in data.header.links [ · #link(l.url)[#l.label]]

== #data.labels.summary
#data.summary

== #data.labels.experiences
#for e in data.experiences {
  block(breakable: false, below: 1.2em)[
    #grid(
      columns: (1fr, auto),
      column-gutter: 6mm,
      [=== #e.role],
      text(fill: color("muted"))[#e.period],
    )
    #v(-0.1em)
    #text(weight: "medium")[#e.company]#if e.location != none [#text(fill: color("muted"))[ · #e.location]]
    #v(0.1em)
    #text(fill: color("muted"))[#e.context]
    #v(0.2em)
    #for a in e.achievements [
      - #a
    ]
  ]
}

== #data.labels.earlier
#for e in data.earlier {
  block(breakable: false, below: 0.7em)[
    #text(weight: "semibold")[#e.company] #text(fill: color("muted"))[· #e.role, #e.period] \
    #e.summary
  ]
}
