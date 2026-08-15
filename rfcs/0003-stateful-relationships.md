# RFC 0003: Stateful relationships

Status: **Proposed**

## Summary

A relationship shown by YAWN begins as an offer. It becomes an active canonical
relationship only through explicit consent recorded by authorized principals.

## Current state and lacuna

Typed links describe graph relations, but a public page can still imply a human
relationship that has not been accepted. Public Dave pages need to express how
someone may relate to Dave without claiming that the relationship already
exists.

## Proposed lifecycle

```text
absent -> offered -> accepted | declined | withdrawn
accepted -> active -> paused | ended
```

`offered` is the only state permitted in an anonymous public View. An
offer names its proposer, intended participant roles, purpose, boundaries, and
the action through which consent may be expressed. Acceptance records each
required principal and the exact terms accepted.

No page view, QR scan, download, account creation, message, model inference, or
elapsed time constitutes consent. Interface language such as “work with Dave”
is an invitation, not an active edge.

## Promotion rule

Promotion from `offered` requires:

1. a canonical offer ID and immutable terms hash;
2. authenticated consent from every required human principal;
3. authority to activate the relationship in the named Agent Spaces;
4. inherited privacy and egress boundaries; and
5. an append-only activation event.

Relationship activation does not authorize external effects beyond the grants
recorded on that relationship.

## Compatibility and safety

Existing relationship-like copy remains descriptive testimony unless evidence
of consent exists. It MUST NOT be migrated to `active` by inference. A declined
or withdrawn offer remains in provenance but is omitted from ordinary public
View unless disclosure is explicitly authorized.

## Conformance and decision

The public View schema fixes public `relationship_offer.state` to
`offered`. Acceptance requires authenticated Dave approval and a separate
implementation receipt.
