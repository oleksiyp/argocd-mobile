'use client';

import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as yaml from 'js-yaml';

interface YamlViewerProps {
  yamlContent: string;
  onClose: () => void;
}

export default function YamlViewer({ yamlContent, onClose }: YamlViewerProps) {
  const [formattedYaml, setFormattedYaml] = useState('');

  useEffect(() => {
    // Smart YAML formatting: extract metadata and status to top, minimize noise
    try {
      const parsed = yaml.load(yamlContent) as any;

      if (!parsed || typeof parsed !== 'object') {
        setFormattedYaml(yamlContent);
        return;
      }

      // Create restructured object with proper field ordering
      const restructured: any = {};

      // 1. apiVersion (first)
      if (parsed.apiVersion) restructured.apiVersion = parsed.apiVersion;

      // 2. kind (second)
      if (parsed.kind) restructured.kind = parsed.kind;

      // 3. Minimal metadata (third)
      if (parsed.metadata) {
        restructured.metadata = {
          name: parsed.metadata.name,
          namespace: parsed.metadata.namespace,
        };

        // Add important labels/annotations if present
        if (parsed.metadata.labels && Object.keys(parsed.metadata.labels).length > 0) {
          restructured.metadata.labels = parsed.metadata.labels;
        }

        if (parsed.metadata.annotations) {
          // Filter out noisy annotations
          const importantAnnotations = Object.entries(parsed.metadata.annotations)
            .filter(([key]) => !key.startsWith('kubectl.kubernetes.io/'))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

          if (Object.keys(importantAnnotations).length > 0) {
            restructured.metadata.annotations = importantAnnotations;
          }
        }
      }

      // 4. Status (fourth)
      if (parsed.status) {
        restructured.status = parsed.status;
      }

      // 5. All other fields including spec
      Object.keys(parsed).forEach(key => {
        if (!['metadata', 'apiVersion', 'kind', 'status'].includes(key)) {
          restructured[key] = parsed[key];
        }
      });

      const formattedContent = yaml.dump(restructured, {
        indent: 2,
        lineWidth: -1, // No line wrapping
        noRefs: true,
        sortKeys: false, // Preserve our custom order
      });

      setFormattedYaml(formattedContent);
    } catch (error) {
      console.error('Error formatting YAML:', error);
      setFormattedYaml(yamlContent);
    }
  }, [yamlContent]);

  // Prevent body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* YAML content */}
      <div className="h-full overflow-auto">
        <div className="min-h-full">
          <SyntaxHighlighter
            language="yaml"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              minHeight: '100vh',
              background: '#1e1e1e',
            }}
            showLineNumbers
            wrapLines
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: '#858585',
              textAlign: 'right',
            }}
          >
            {formattedYaml}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
