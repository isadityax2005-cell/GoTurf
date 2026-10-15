'use client';

export default function HydrationFix() {
  const cleanupScript = `
    (function() {
      function cleanElement(el) {
        if (!el || !el.attributes) return;
        var toRemove = [];
        for (var i = 0; i < el.attributes.length; i++) {
          var name = el.attributes[i].name;
          if (
            name === 'bis_skin_checked' ||
            name === 'bis_register' ||
            name.indexOf('bis_') === 0 ||
            name.indexOf('__processed_') === 0 ||
            name === 'cz-shortcut-listen'
          ) {
            toRemove.push(name);
          }
        }
        for (var j = 0; j < toRemove.length; j++) {
          el.removeAttribute(toRemove[j]);
        }
      }

      function cleanTree(root) {
        if (!root) return;
        cleanElement(root);
        if (root.querySelectorAll) {
          try {
            var els = root.querySelectorAll('[bis_skin_checked], [bis_register], [cz-shortcut-listen]');
            for (var k = 0; k < els.length; k++) {
              cleanElement(els[k]);
            }
          } catch(e) {}
        }
      }

      if (typeof document !== 'undefined') {
        cleanTree(document.documentElement);

        try {
          var observer = new MutationObserver(function(mutations) {
            for (var m = 0; m < mutations.length; m++) {
              var mut = mutations[m];
              if (mut.type === 'attributes') {
                cleanElement(mut.target);
              } else if (mut.addedNodes) {
                for (var n = 0; n < mut.addedNodes.length; n++) {
                  var node = mut.addedNodes[n];
                  if (node.nodeType === 1) {
                    cleanTree(node);
                  }
                }
              }
            }
          });

          observer.observe(document.documentElement, {
            attributes: true,
            childList: true,
            subtree: true
          });

          // Disconnect after React has finished mounting
          if (document.readyState === 'complete') {
            setTimeout(function() { observer.disconnect(); }, 2000);
          } else {
            window.addEventListener('load', function() {
              setTimeout(function() { observer.disconnect(); }, 2000);
            });
          }
        } catch(e) {}
      }
    })();
  `;

  return (
    <script
      id="hydration-extension-fix"
      dangerouslySetInnerHTML={{ __html: cleanupScript }}
    />
  );
}
