<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fn="http://www.w3.org/2005/xpath-functions">
  <xsl:param name="sortKey">title</xsl:param>
  <xsl:param name="sortOrder">ascending</xsl:param>
  <xsl:param name="sortType">text</xsl:param>
  <xsl:param name="filterKey">*</xsl:param>
  <xsl:param name="filterTitle">*</xsl:param>

  <xsl:template match="/">
        <table id="resultTable" class="table table-striped">
          <thead>
            <tr>
              <th><a href="javascript: resort('title');">Title</a><xsl:call-template name="hdr"><xsl:with-param name="header" select="'title'" /></xsl:call-template></th>
              <th><a href="javascript: resort('year');">Year</a><xsl:call-template name="hdr"><xsl:with-param name="header" select="'year'" /></xsl:call-template></th>
              <th><a href="javascript: resort('type');">Type</a><xsl:call-template name="hdr"><xsl:with-param name="header" select="'type'" /></xsl:call-template></th>
              <th><a href="javascript: resort('hasBackup');">Has Backup?</a><xsl:call-template name="hdr"><xsl:with-param name="header" select="'hasBackup'" /></xsl:call-template></th>
              <th><a href="javascript: resort('insertDTTM');">Insert Date/Time</a><xsl:call-template name="hdr"><xsl:with-param name="header" select="'insertDTTM'" /></xsl:call-template></th>
              <th><a href="javascript: resort('viewSource');">Source</a><xsl:call-template name="hdr"><xsl:with-param name="header" select="'viewSource'" /></xsl:call-template></th>
            </tr>
          </thead>
          <tbody>
          <xsl:for-each select="entries/entry">
            <xsl:sort select="*[name(.)=$sortKey]|@*[name(.)=$sortKey]" order="{$sortOrder}" data-type="{$sortType}" />
            <xsl:if test="($filterKey = '*' or type = $filterKey)">
            <xsl:variable name="lowercase">abcdefghijklmnopqrstuvwxyz</xsl:variable>
            <xsl:variable name="uppercase">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>
            <xsl:if test="($filterTitle = '*' or (contains(translate(title, $uppercase, $lowercase), translate($filterTitle, $uppercase, $lowercase)))) and string-length(title) > 0">
            <tr>
              <td><xsl:value-of select="title"/></td>
              <td><xsl:value-of select="year"/></td>
              <td><xsl:value-of select="type"/></td>
              <td>
                <xsl:if test="hasBackup = 0">
                  <xsl:text>No</xsl:text>
                </xsl:if>
                <xsl:if test="hasBackup = 1">
                  <xsl:text>Yes</xsl:text>
                </xsl:if>
              </td>
              <td><xsl:value-of select="insertDTTM"/></td>
              <td>
                <xsl:if test="viewSource = ''">
                  <xsl:text>--</xsl:text>
                </xsl:if>
                <xsl:if test="viewSource != ''">
                  <xsl:value-of select="viewSource"/>
                </xsl:if>
              </td>
            </tr>
            </xsl:if>
            </xsl:if>
          </xsl:for-each>
          </tbody>
        </table>

  </xsl:template>
  <xsl:template name="hdr">
    <xsl:param name="header" />
    <xsl:if test="$sortKey = $header">
      <xsl:if test="$sortOrder = 'ascending'"><font color="red">&#x25B2;</font></xsl:if>
      <xsl:if test="$sortOrder = 'descending'"><font color="red">&#x25BC;</font></xsl:if>
    </xsl:if>
    <xsl:if test="$sortKey != $header"></xsl:if>
  </xsl:template>
</xsl:stylesheet>
