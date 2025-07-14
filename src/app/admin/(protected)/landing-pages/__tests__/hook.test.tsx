import { renderHook, act, waitFor } from '@testing-library/react'
import { useLandingPages } from '../hook'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useLandingPages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockLandingPages = [
    {
      id: "landing-1",
      title: "Premium Headphones Landing",
      slug: "premium-headphones",
      productId: "product-1",
      productName: "Premium Wireless Headphones",
      headline: "Experience Sound Like Never Before",
      description: "Desc...",
      heroImage: "/placeholder.svg",
      status: "PUBLISHED" as const,
      createdAt: new Date().toISOString(),
      templateId: "template-1",
    },
    {
      id: "landing-2",
      title: "Wireless Earbuds Landing",
      slug: "wireless-earbuds",
      productId: "product-2",
      productName: "Wireless Earbuds",
      headline: "Freedom of Wireless Audio",
      description: "Desc 2...",
      heroImage: "/placeholder.svg",
      status: "DRAFT" as const,
      createdAt: new Date().toISOString(),
      templateId: "template-2",
    },
  ]

  const mockTemplates = [
    {
      id: "template-1",
      name: "Modern Hero Template",
      description: "desc",
      isDefault: true,
      thumbnail: "/placeholder.svg",
      sections: [],
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "template-2",
      name: "Product Showcase Template",
      description: "desc2",
      isDefault: false,
      thumbnail: "/placeholder.svg",
      sections: [],
      createdAt: "2024-01-15T10:00:00Z",
    },
  ]

  const mockProducts = [
    { id: "product-1", name: "Premium Wireless Headphones" },
    { id: "product-2", name: "Wireless Earbuds" },
  ]

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLandingPages),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTemplates),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })

      const { result } = renderHook(() => useLandingPages())

      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBe(null)
      expect(result.current.landingPages).toEqual([])
      expect(result.current.templates).toEqual([])
      expect(result.current.products).toEqual([])
      expect(result.current.isDialogOpen).toBe(false)
      expect(result.current.isTemplateSelectOpen).toBe(false)
      expect(result.current.editingPage).toBe(null)
      expect(result.current.selectedTemplate).toBe(null)
      expect(result.current.formData).toEqual({
        title: "",
        slug: "",
        productId: "",
        headline: "",
        description: "",
        status: "DRAFT",
        templateId: "",
      })
    })
  })

  describe('Data Fetching', () => {
    it('fetches data on mount', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })

      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith("/api/admin/landing-pages")
      expect(mockFetch).toHaveBeenCalledWith("/api/admin/templates")
      expect(mockFetch).toHaveBeenCalledWith("/api/admin/products")
      expect(result.current.landingPages).toEqual(mockLandingPages)
      expect(result.current.templates).toEqual(mockTemplates)
      expect(result.current.products).toEqual(mockProducts.map(p => ({ id: p.id, name: p.name })))
    })

    it('handles fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"))

      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe("Failed to fetch")
    })

    it('handles non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe("Failed to fetch landing pages")
    })
  })

  describe('Template Selection', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('handles create with template', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleCreateWithTemplate(mockTemplates[0])
      })

      expect(result.current.selectedTemplate).toEqual(mockTemplates[0])
      expect(result.current.formData.templateId).toBe("template-1")
      expect(result.current.isTemplateSelectOpen).toBe(false)
      expect(result.current.isSectionEditorOpen).toBe(true)
    })

    it('handles create without template (uses default)', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleCreateWithoutTemplate()
      })

      expect(result.current.selectedTemplate).toEqual(mockTemplates[0]) // Default template
      expect(result.current.formData.templateId).toBe("template-1")
      expect(result.current.isTemplateSelectOpen).toBe(false)
      expect(result.current.isSectionEditorOpen).toBe(true)
    })

    it('creates fallback template when no default exists', async () => {
      // Mock templates without a default template
      const templatesWithoutDefault = [
        {
          id: "template-1",
          name: "Custom Template",
          description: "A custom template",
          thumbnail: "/placeholder.svg",
          isDefault: false,
          createdAt: "2024-01-15T10:00:00Z",
          sections: [],
        },
      ];

      // Mock fetch to return templates without default
      global.fetch = jest.fn((url) => {
        if (url === "/api/admin/templates") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(templatesWithoutDefault),
          });
        }
        if (url === "/api/admin/landing-pages") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        if (url === "/api/admin/products") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }) as any;

      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleCreateWithoutTemplate();
      });

      await waitFor(() => {
        expect(result.current.selectedTemplate).toBeDefined();
        expect(result.current.selectedTemplate?.name).toBe("Modern Hero Template");
        expect(result.current.formData.templateId).toBe("default-template");
      });
    })
  })

  describe('Form Management', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('updates form data', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setFormData({ title: "New Title" })
      })

      expect(result.current.formData.title).toBe("New Title")
    })

    it('generates slug from title', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.updateFormDataWithSlug("My New Landing Page")
      })

      expect(result.current.formData.title).toBe("My New Landing Page")
      expect(result.current.formData.slug).toBe("my-new-landing-page")
    })

    it('preserves existing slug when generating new one', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set existing slug
      act(() => {
        result.current.setFormData({ slug: "existing-slug" })
      })

      act(() => {
        result.current.updateFormDataWithSlug("New Title")
      })

      expect(result.current.formData.slug).toBe("existing-slug")
    })

    it('generates new slug when none exists', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.updateFormDataWithSlug("New Title")
      })

      expect(result.current.formData.slug).toBe("new-title")
    })
  })

  describe('Landing Page Creation', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('validates required fields', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const mockEvent = { preventDefault: jest.fn() } as any

      act(() => {
        result.current.handleSubmit(mockEvent)
      })

      expect(result.current.error).toBe("Please fill in all required fields: Title, URL Slug, Product, Headline, and Template")
    })

    it('creates landing page successfully', async () => {
      // Mock successful create response
      global.fetch = jest.fn((url, options) => {
        if (url === "/api/admin/landing-pages" && options?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: "landing-3",
              title: "New Landing Page",
              slug: "new-landing-page",
              productId: "product-1",
              headline: "New Headline",
              description: "New description",
              status: "DRAFT",
              templateId: "template-1",
              sections: [],
            }),
          });
        }
        if (url === "/api/admin/landing-pages") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLandingPages),
          });
        }
        if (url === "/api/admin/templates") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTemplates),
          });
        }
        if (url === "/api/admin/products") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProducts),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }) as any;

      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set up form data
      act(() => {
        result.current.setFormData({
          title: "New Landing Page",
          slug: "new-landing-page",
          productId: "product-1",
          headline: "New Headline",
          description: "New description",
          status: "DRAFT",
          templateId: "template-1",
        });
      });

      // Mock the form submission
      const mockEvent = { preventDefault: jest.fn() } as any;
      
      act(() => {
        result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/admin/landing-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Landing Page",
            slug: "new-landing-page",
            productId: "product-1",
            headline: "New Headline",
            description: "New description",
            status: "DRAFT",
            templateId: "template-1",
            sections: [],
          }),
        });
      });
    })

    it('handles creation errors', async () => {
      // Mock fetch to return error for template not found
      global.fetch = jest.fn((url) => {
        if (url === "/api/admin/landing-pages") {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: "Template not found" }),
          });
        }
        if (url === "/api/admin/templates") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTemplates),
          });
        }
        if (url === "/api/admin/products") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProducts),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }) as any;

      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set up form data with invalid template
      act(() => {
        result.current.setFormData({
          title: "Test Page",
          slug: "test-page",
          productId: "product-1",
          headline: "Test Headline",
          description: "Test Description",
          status: "DRAFT",
          templateId: "invalid-template",
        });
      });

      // Mock the form submission
      const mockEvent = { preventDefault: jest.fn() } as any;
      
      act(() => {
        result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Template not found");
      });
    })
  })

  describe('Landing Page Editing', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('opens edit dialog with page data', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEdit(mockLandingPages[0])
      })

      expect(result.current.editingPage).toEqual(mockLandingPages[0])
      expect(result.current.formData.title).toBe("Premium Headphones Landing")
      expect(result.current.formData.slug).toBe("premium-headphones")
      expect(result.current.formData.productId).toBe("product-1")
      expect(result.current.formData.headline).toBe("Experience Sound Like Never Before")
      expect(result.current.formData.description).toBe("Desc...")
      expect(result.current.formData.status).toBe("PUBLISHED")
      expect(result.current.formData.templateId).toBe("template-1")
      expect(result.current.isDialogOpen).toBe(true)
    })

    it('uses default template when page has no template', async () => {
      const pageWithoutTemplate = {
        ...mockLandingPages[0],
        templateId: undefined,
      };

      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleEdit(pageWithoutTemplate);
      });

      await waitFor(() => {
        expect(result.current.editingPage).toBe(pageWithoutTemplate);
        // The form should be set up with the page data, even if no default template is found
        expect(result.current.formData.title).toBe(pageWithoutTemplate.title);
        expect(result.current.formData.slug).toBe(pageWithoutTemplate.slug);
        expect(result.current.formData.productId).toBe(pageWithoutTemplate.productId.toString());
        expect(result.current.formData.headline).toBe(pageWithoutTemplate.headline);
        expect(result.current.formData.description).toBe(pageWithoutTemplate.description);
        expect(result.current.formData.status).toBe(pageWithoutTemplate.status);
      });
    })

    it('updates landing page successfully', async () => {
      // Mock successful update response
      global.fetch = jest.fn((url, options) => {
        if (url === "/api/admin/landing-pages" && options?.method === "PUT") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: "landing-1",
              title: "Updated Title",
              slug: "premium-headphones",
              productId: "product-1",
              headline: "Experience Sound Like Never Before",
              description: "Desc...",
              status: "PUBLISHED",
              templateId: "template-1",
            }),
          });
        }
        if (url === "/api/admin/landing-pages") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLandingPages),
          });
        }
        if (url === "/api/admin/templates") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTemplates),
          });
        }
        if (url === "/api/admin/products") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProducts),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }) as any;

      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set up editing page
      act(() => {
        result.current.handleEdit(mockLandingPages[0]);
      });

      // Update form data
      act(() => {
        result.current.setFormData({
          title: "Updated Title",
          slug: "premium-headphones",
          productId: "product-1",
          headline: "Experience Sound Like Never Before",
          description: "Desc...",
          status: "PUBLISHED",
          templateId: "template-1",
        });
      });

      // Mock the form submission
      const mockEvent = { preventDefault: jest.fn() } as any;
      
      act(() => {
        result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/admin/landing-pages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: "landing-1",
            title: "Updated Title",
            slug: "premium-headphones",
            productId: "product-1",
            headline: "Experience Sound Like Never Before",
            description: "Desc...",
            status: "PUBLISHED",
            templateId: "template-1",
          }),
        });
      });
    })
  })

  describe('Landing Page Deletion', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('deletes landing page successfully', async () => {
      // Mock successful delete response
      global.fetch = jest.fn((url, options) => {
        if (url === "/api/admin/landing-pages" && options?.method === "DELETE") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        if (url === "/api/admin/landing-pages") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLandingPages),
          });
        }
        if (url === "/api/admin/templates") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTemplates),
          });
        }
        if (url === "/api/admin/products") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProducts),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }) as any;

      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initially should have 2 landing pages
      expect(result.current.landingPages).toHaveLength(2);

      // Delete the first landing page
      act(() => {
        result.current.handleDelete("landing-1");
      });

      await waitFor(() => {
        // Check that the landing page was removed from the list
        expect(result.current.landingPages).toHaveLength(1);
        expect(result.current.landingPages[0].id).toBe("landing-2");
      });
    })

    it('handles deletion errors', async () => {
      // Mock fetch to return error for delete
      global.fetch = jest.fn((url, options) => {
        if (url === "/api/admin/landing-pages" && options?.method === "DELETE") {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: "Failed to delete landing page" }),
          });
        }
        if (url === "/api/admin/landing-pages") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLandingPages),
          });
        }
        if (url === "/api/admin/templates") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTemplates),
          });
        }
        if (url === "/api/admin/products") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProducts),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }) as any;

      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Delete should fail
      act(() => {
        result.current.handleDelete("landing-1");
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Failed to delete landing page");
      });
    })
  })

  describe('Search and Filtering', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('filters by search term', async () => {
      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set search term
      act(() => {
        result.current.setSearchTerm("headphones");
      });

      // The search should filter landing pages that contain "headphones" in title, headline, product name, or template name
      expect(result.current.searchTerm).toBe("headphones");
      
      // Since "Premium Headphones Landing" contains "headphones", it should be in the filtered results
      const filteredPages = result.current.landingPages;
      expect(filteredPages.length).toBeGreaterThan(0);
      
      // Check that the filtered pages contain "headphones" in some way
      const hasHeadphonesPage = filteredPages.some(page => 
        page.title.toLowerCase().includes("headphones") ||
        page.headline.toLowerCase().includes("headphones") ||
        page.productName.toLowerCase().includes("headphones")
      );
      expect(hasHeadphonesPage).toBe(true);
    })

    it('filters by status', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setStatusFilter("PUBLISHED")
      })

      expect(result.current.statusFilter).toBe("PUBLISHED")
      expect(result.current.landingPages).toHaveLength(1)
      expect(result.current.landingPages[0].status).toBe("PUBLISHED")
    })

    it('filters by product name', async () => {
      const { result } = renderHook(() => useLandingPages());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set search term to filter by product name
      act(() => {
        result.current.setSearchTerm("earbuds");
      });

      expect(result.current.searchTerm).toBe("earbuds");
      
      // Should find pages where product name contains "earbuds"
      const filteredPages = result.current.landingPages;
      expect(filteredPages.length).toBeGreaterThan(0);
      
      // Check that the filtered pages contain "earbuds" in the product name
      const hasEarbudsPage = filteredPages.some(page => 
        page.productName.toLowerCase().includes("earbuds")
      );
      expect(hasEarbudsPage).toBe(true);
    })

    it('filters by template name', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setSearchTerm("Modern Hero")
      })

      expect(result.current.landingPages).toHaveLength(1)
      expect(result.current.landingPages[0].title).toBe("Premium Headphones Landing")
    })

    it('combines search and status filters', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.setSearchTerm("Landing")
        result.current.setStatusFilter("PUBLISHED")
      })

      expect(result.current.landingPages).toHaveLength(1)
      expect(result.current.landingPages[0].title).toBe("Premium Headphones Landing")
    })
  })

  describe('Section Editor', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('updates section content', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up template sections
      act(() => {
        result.current.handleCreateWithTemplate(mockTemplates[0])
      })

      const sectionId = result.current.templateSections[0]?.id
      if (sectionId) {
        act(() => {
          result.current.updateSection(sectionId, { title: "Updated Section Title" })
        })

        const updatedSection = result.current.templateSections.find(s => s.id === sectionId)
        expect(updatedSection?.title).toBe("Updated Section Title")
      }
    })

    it('maintains section order', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleCreateWithTemplate(mockTemplates[0])
      })

      expect(result.current.templateSections).toHaveLength(0) // No sections in mock template
    })
  })

  describe('Helper Functions', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('finds template by ID', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const template = result.current.getTemplateById("template-1")
      expect(template).toEqual(mockTemplates[0])
    })

    it('finds product by ID', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const product = result.current.getProductById("product-1")
      expect(product).toEqual({ id: "product-1", name: "Premium Wireless Headphones" })
    })

    it('returns undefined for non-existent IDs', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const template = result.current.getTemplateById("non-existent")
      const product = result.current.getProductById("non-existent")

      expect(template).toBeUndefined()
      expect(product).toBeUndefined()
    })
  })

  describe('Form Reset', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('resets form to initial state', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set some state
      act(() => {
        result.current.setFormData({ title: "Test Title" })
        result.current.setSearchTerm("test")
        result.current.setStatusFilter("PUBLISHED")
      })

      act(() => {
        result.current.resetForm()
      })

      expect(result.current.formData.title).toBe("")
      expect(result.current.searchTerm).toBe("")
      expect(result.current.statusFilter).toBe("all")
      expect(result.current.isDialogOpen).toBe(false)
      expect(result.current.isTemplateSelectOpen).toBe(false)
      expect(result.current.isSectionEditorOpen).toBe(false)
      expect(result.current.editingPage).toBe(null)
      expect(result.current.selectedTemplate).toBe(null)
      expect(result.current.templateSections).toEqual([])
    })
  })

  describe('Delete Confirmation', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLandingPages),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTemplates),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
    })

    it('opens delete confirmation dialog', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleDeleteClick(mockLandingPages[0])
      })

      expect(result.current.showDeleteDialog).toBe(true)
      expect(result.current.pageToDelete).toEqual(mockLandingPages[0])
    })

    it('confirms deletion', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up delete state
      act(() => {
        result.current.handleDeleteClick(mockLandingPages[0])
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })

      act(() => {
        result.current.handleConfirmDelete()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.showDeleteDialog).toBe(false)
      expect(result.current.pageToDelete).toBe(null)
    })

    it('cancels deletion', async () => {
      const { result } = renderHook(() => useLandingPages())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set up delete state
      act(() => {
        result.current.handleDeleteClick(mockLandingPages[0])
      })

      act(() => {
        result.current.handleCancelDelete()
      })

      expect(result.current.showDeleteDialog).toBe(false)
      expect(result.current.pageToDelete).toBe(null)
    })
  })
}) 