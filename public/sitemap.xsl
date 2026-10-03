<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html>
      <head>
        <title>Slate Academy - Sitemap</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .header {
            background: white;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
          }
          .header h1 {
            color: #333;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header p {
            color: #666;
            font-size: 16px;
          }
          .stats {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-top: 20px;
            flex-wrap: wrap;
          }
          .stat-card {
            background: #f0f0f0;
            padding: 10px 20px;
            border-radius: 8px;
          }
          .stat-card span {
            font-weight: bold;
            color: #667eea;
            font-size: 24px;
          }
          .sitemap-table {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
          }
          tr:hover {
            background-color: #f9f9f9;
          }
          a {
            color: #667eea;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-high {
            background: #d4edda;
            color: #155724;
          }
          .badge-medium {
            background: #fff3cd;
            color: #856404;
          }
          .badge-low {
            background: #f8d7da;
            color: #721c24;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: white;
            font-size: 14px;
          }
          @media (max-width: 768px) {
            th, td {
              padding: 8px 10px;
              font-size: 12px;
            }
            .header h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗺️ Slate Academy Sitemap</h1>
            <p>Complete list of all pages available for search engines</p>
            <div class="stats">
              <div class="stat-card">
                <span><xsl:value-of select="count(urlset/url)"/></span>
                <p>Total URLs</p>
              </div>
              <div class="stat-card">
                <span>XML</span>
                <p>Format</p>
              </div>
              <div class="stat-card">
                <span><xsl:value-of select="substring-before(substring-after(urlset/url/lastmod, 'T'), '+')"/></span>
                <p>Last Updated</p>
              </div>
            </div>
          </div>

          <div class="sitemap-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>URL</th>
                  <th>Last Modified</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="urlset/url">
                  <tr>
                    <td><xsl:number value="position()" format="1"/></td>
                    <td>
                      <a href="{loc}" target="_blank">
                        <xsl:value-of select="loc"/>
                      </a>
                    </td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="lastmod">
                          <xsl:value-of select="substring-before(lastmod, 'T')"/>
                        </xsl:when>
                        <xsl:otherwise>2026-04-05</xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="priority">
                          <xsl:variable name="p" select="priority"/>
                          <xsl:choose>
                            <xsl:when test="$p >= 0.8">
                              <span class="badge badge-high">High (<xsl:value-of select="$p"/>)</span>
                            </xsl:when>
                            <xsl:when test="$p >= 0.5">
                              <span class="badge badge-medium">Medium (<xsl:value-of select="$p"/>)</span>
                            </xsl:when>
                            <xsl:otherwise>
                              <span class="badge badge-low">Low (<xsl:value-of select="$p"/>)</span>
                            </xsl:otherwise>
                          </xsl:choose>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="badge badge-medium">Auto</span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Generated for Slate Academy | Last updated: <xsl:value-of select="substring-before(substring-after(urlset/url/lastmod, 'T'), '+')"/></p>
            <p>Gmail:- slateacademy3@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>